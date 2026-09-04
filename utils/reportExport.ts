import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { ReportResponse } from "@/redux/api/AI/reportsApi";

export const downloadReportPDF = async (report: ReportResponse, businessName: string, location: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Header Section
    // Add Logo
    try {
        const logoUrl = window.location.origin + "/logo.svg";
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = logoUrl;
        await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
        });
        if (img.complete && img.width > 0) {
            const canvas = document.createElement("canvas");
            canvas.width = img.width * 2; // Higher quality
            canvas.height = img.height * 2;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL("image/png");
                doc.addImage(dataUrl, 'PNG', 10, 8, 25, 10); // Left Top Side
            }
        }
    } catch (e) {
        console.error("Failed to load logo", e);
    }

    // Business Name (Center, Bold, Big)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    const titleWidth = doc.getTextWidth(businessName);
    doc.text(businessName, (pageWidth - titleWidth) / 2, 20);

    // Location (Center, Regular)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const locWidth = doc.getTextWidth(location);
    doc.text(location, (pageWidth - locWidth) / 2, 28);

    // Time Range
    doc.setFontSize(10);
    doc.text(`Period: ${report.period}`, 15, 40);
    doc.text(`Frequency: ${report.report_frequency.toUpperCase()}`, pageWidth - 15, 40, { align: "right" });
    
    doc.setLineWidth(0.5);
    doc.line(15, 45, pageWidth - 15, 45);

    let currentY = 55;

    // 2. KPIs Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("1. Key Performance Indicators", 15, currentY);
    currentY += 10;

    const kpiData = [
        ["Metric", "Value", "Change vs Prev"],
        ["Avg. Rating", report.kpis.avg_rating.value?.toFixed(1) || "0.0", `${report.kpis.avg_rating.change ?? 0 > 0 ? "+" : ""}${report.kpis.avg_rating.change ?? 0}`],
        ["Total Reviews", report.kpis.reviews.value?.toString() || "0", `${report.kpis.reviews.change ?? 0 > 0 ? "+" : ""}${report.kpis.reviews.change ?? 0}`],
        ["Satisfaction", `${report.kpis.satisfaction.value || 0}%`, `${report.kpis.satisfaction.change ?? 0 > 0 ? "+" : ""}${report.kpis.satisfaction.change ?? 0}%`],
        ["Response Rate", `${report.kpis.response_rate.value || 0}%`, `${report.kpis.response_rate.change ?? 0 > 0 ? "+" : ""}${report.kpis.response_rate.change ?? 0}%`]
    ];

    autoTable(doc, {
        startY: currentY,
        head: [kpiData[0]],
        body: kpiData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [0, 102, 255] },
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // 3. Executive Summary
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("2. Executive Summary", 15, currentY);
    currentY += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(report.executive_summary, pageWidth - 30);
    doc.text(summaryLines, 15, currentY);
    currentY += (summaryLines.length * 5) + 10;

    // Check for page break
    if (currentY > 250) { doc.addPage(); currentY = 20; }

    // 4. Sentiment Breakdown
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("3. Sentiment Breakdown", 15, currentY);
    currentY += 8;
    
    const sentimentData = [
        ["Sentiment", "Percentage", "Review Count"],
        ["Positive", `${report.sentiment_breakdown.positive.percent}%`, report.sentiment_breakdown.positive.count],
        ["Neutral", `${report.sentiment_breakdown.neutral.percent}%`, report.sentiment_breakdown.neutral.count],
        ["Negative", `${report.sentiment_breakdown.negative.percent}%`, report.sentiment_breakdown.negative.count]
    ];

    autoTable(doc, {
        startY: currentY,
        head: [sentimentData[0]],
        body: sentimentData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [100, 100, 100] },
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // 5. Top Complaints & Praises
    if (currentY > 200) { doc.addPage(); currentY = 20; }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("4. Key Customer Feedback", 15, currentY);
    currentY += 10;

    const feedbackData: any[] = [];
    const maxLen = Math.max(report.top_complaints.length, report.top_praises.length);
    for (let i = 0; i < maxLen; i++) {
        const complaint = report.top_complaints[i];
        const praise = report.top_praises[i];
        feedbackData.push([
            complaint ? (complaint.issue || complaint.complaint || "N/A") : "",
            praise ? (praise.strength || praise.praise || "N/A") : ""
        ]);
    }

    autoTable(doc, {
        startY: currentY,
        head: [["Top Complaints", "Top Praises"]],
        body: feedbackData,
        theme: 'striped',
        headStyles: { fillColor: [220, 53, 69] }, // Red for complaints header or split colors if possible
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // 6. AI Recommendations
    if (currentY > 200) { doc.addPage(); currentY = 20; }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("5. AI Recommendations", 15, currentY);
    currentY += 10;

    report.ai_recommendations.forEach((rec, idx) => {
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`${idx + 1}. ${rec.title}`, 15, currentY);
        currentY += 6;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const descLines = doc.splitTextToSize(rec.description, pageWidth - 30);
        doc.text(descLines, 15, currentY);
        currentY += (descLines.length * 5) + 3;
        doc.setFont("helvetica", "italic");
        doc.text(`Impact: ${rec.estimated_impact}`, 15, currentY);
        currentY += 10;
        if (currentY > 270) { doc.addPage(); currentY = 20; }
    });

    // 7. Action Plan
    currentY += 5;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("6. Recommended Action Plan", 15, currentY);
    currentY += 10;
    
    report.action_plan.forEach((step, idx) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const stepLines = doc.splitTextToSize(`${idx + 1}. ${step}`, pageWidth - 30);
        doc.text(stepLines, 15, currentY);
        currentY += (stepLines.length * 5) + 3;
        if (currentY > 270) { doc.addPage(); currentY = 20; }
    });

    doc.save(`${businessName}_Report_${report.period.replace(/ /g, '_')}.pdf`);
};

export const downloadReportExcel = (report: ReportResponse, businessName: string) => {
    const wb = XLSX.utils.book_new();

    // 1. Overview Sheet
    const overviewData: (string | number | null | undefined)[][] = [
        ["Report Title", report.report_title],
        ["Period", report.period],
        ["Frequency", report.report_frequency],
        [],
        ["KPIs", "Value", "Change"],
        ["Avg. Rating", report.kpis.avg_rating.value, report.kpis.avg_rating.change],
        ["Total Reviews", report.kpis.reviews.value, report.kpis.reviews.change],
        ["Satisfaction (%)", report.kpis.satisfaction.value, report.kpis.satisfaction.change],
        ["Response Rate (%)", report.kpis.response_rate.value, report.kpis.response_rate.change],
        [],
        ["Executive Summary"],
        [report.executive_summary]
    ];
    const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(wb, wsOverview, "Overview");

    // 2. Sentiment & Trends Sheet
    const trendData: (string | number | null | undefined)[][] = [
        ["Sentiment Breakdown", "Percentage", "Count"],
        ["Positive", report.sentiment_breakdown.positive.percent, report.sentiment_breakdown.positive.count],
        ["Neutral", report.sentiment_breakdown.neutral.percent, report.sentiment_breakdown.neutral.count],
        ["Negative", report.sentiment_breakdown.negative.percent, report.sentiment_breakdown.negative.count],
        [],
        ["Review Volume Trend", "Count"],
        ...report.review_volume_trend.map(t => [t.period, t.count]),
        [],
        ["Rating Trend", "Rating"],
        ...report.rating_trend.map(t => [t.period, t.rating])
    ];
    const wsTrends = XLSX.utils.aoa_to_sheet(trendData);
    XLSX.utils.book_append_sheet(wb, wsTrends, "Trends");

    // 3. Feedback Sheet
    const feedbackData: (string | number)[][] = [
        ["Top Complaints", "Mentions", "", "Top Praises", "Mentions"],
    ];
    const maxLen = Math.max(report.top_complaints.length, report.top_praises.length);
    for (let i = 0; i < maxLen; i++) {
        const c = report.top_complaints[i];
        const p = report.top_praises[i];
        feedbackData.push([
            c ? (c.issue || c.complaint || "") : "",
            c ? (c.mentions || 0) : "",
            "",
            p ? (p.strength || p.praise || "") : "",
            p ? (p.mentions || 0) : ""
        ]);
    }
    const wsFeedback = XLSX.utils.aoa_to_sheet(feedbackData);
    XLSX.utils.book_append_sheet(wb, wsFeedback, "Feedback");

    // 4. Recommendations & Action Plan
    const recoData = [
        ["AI Recommendations", "Description", "Impact"],
        ...report.ai_recommendations.map(r => [r.title, r.description, r.estimated_impact]),
        [],
        ["Action Plan"],
        ...report.action_plan.map((s, i) => [`${i + 1}. ${s}`])
    ];
    const wsReco = XLSX.utils.aoa_to_sheet(recoData);
    XLSX.utils.book_append_sheet(wb, wsReco, "Action Plan");

    XLSX.writeFile(wb, `${businessName}_Report_${report.period.replace(/ /g, '_')}.xlsx`);
};
