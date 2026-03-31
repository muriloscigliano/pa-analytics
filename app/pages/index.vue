<template>
  <div class="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-14">
    <div class="section-gap"><DashboardHeader /></div>

    <!-- 1. TRAFFIC & ACQUISITION -->
    <div class="dash-section-header">Traffic & Acquisition</div>
    <div class="section-gap"><KpiCards /></div>
    <div class="section-gap"><PageviewChart /></div>
    <div class="section-gap"><TopPagesTable /></div>
    <div class="section-gap"><EntryPages /></div>
    <div class="section-gap"><PageFlow /></div>
    <div class="section-gap"><TrafficSources /></div>
    <div class="section-gap"><TrafficByHour /></div>

    <!-- 2. CONTENT ENGAGEMENT -->
    <div class="dash-section-header">Content Engagement</div>
    <div class="section-gap"><SectionEngagement /></div>
    <div class="section-gap"><SectionHeatmap /></div>
    <div class="section-gap"><SectionFunnel /></div>

    <!-- 3. CTA PERFORMANCE -->
    <div class="dash-section-header">CTA Performance</div>
    <div class="section-gap"><CtaPerformance /></div>
    <div class="section-gap"><HeaderCta /></div>

    <!-- 4. CONVERSION FUNNEL -->
    <div class="dash-section-header">Conversion Funnel</div>
    <div class="section-gap"><FunnelChart /></div>
    <div class="section-gap"><PageFunnels /></div>
    <div class="section-gap"><FormSubmissions /></div>
    <div class="grid grid-cols-1 lg:grid-cols-2 dash-gap section-gap"><FormByDay /><FormByHour /></div>
    <div class="section-gap"><FormQuality /></div>

    <!-- 5. LEAD QUALITY -->
    <div class="dash-section-header">Lead Quality</div>
    <div class="section-gap"><ConverterJourney /></div>
    <div class="section-gap"><VisitorConversion /></div>
    <div class="section-gap"><AbConversion /></div>
    <div class="section-gap"><SourceConversion /></div>
    <div class="section-gap"><ConvertingPages /></div>
    <div class="section-gap"><PageDepth /></div>
    <div class="section-gap"><ConverterPages /></div>
    <div class="section-gap"><PagesToPricing /></div>
    <div class="section-gap"><DeviceConversion /></div>
    <div class="section-gap"><TimeToConvert /></div>

    <!-- 6. MENU & NAVIGATION -->
    <div class="dash-section-header">Menu & Navigation</div>
    <div class="section-gap"><MenuNavigation /></div>
    <div class="section-gap"><LoginClicks /></div>

    <!-- 7. TECHNICAL -->
    <div class="dash-section-header">Technical</div>
    <div class="section-gap"><LeadsSignups /></div>
    <div class="section-gap"><PagePaths /></div>
    <div class="section-gap"><PageExits /></div>
    <div class="section-gap"><ScrollDepth /></div>
    <div class="grid grid-cols-1 lg:grid-cols-2 dash-gap section-gap"><GeoBreakdown /><DeviceBreakdown /></div>
    <div class="section-gap"><VisitorTypes /></div>
    <div class="section-gap"><AbComparison /></div>
    <div class="section-gap"><WebVitals /></div>
  </div>
</template>
