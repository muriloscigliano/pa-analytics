<template>
  <div class="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-14">
    <div class="section-gap"><DashboardHeader /></div>
    <div class="section-gap"><KpiCards /></div>
    <div class="grid grid-cols-1 lg:grid-cols-2 dash-gap section-gap"><FunnelChart /><VisitorTypes /></div>
    <div class="section-gap"><SectionEngagement /></div>
    <div class="section-gap"><PageviewChart /></div>
    <div class="section-gap"><TopPagesTable /></div>
    <div class="section-gap"><TopClicks /></div>
    <div class="section-gap"><PageExits /></div>
    <div class="section-gap"><FormSubmissions /></div>
    <div class="section-gap"><MenuNavigation /></div>
    <div class="section-gap"><NavSources /></div>
    <div class="section-gap"><LeadsSignups /></div>
    <div class="section-gap"><AbComparison /></div>
    <div class="section-gap"><ScrollDepth /></div>
    <div class="grid grid-cols-1 lg:grid-cols-3 dash-gap section-gap"><TrafficSources /><GeoBreakdown /><DeviceBreakdown /></div>
    <div class="section-gap"><WebVitals /></div>
  </div>
</template>
