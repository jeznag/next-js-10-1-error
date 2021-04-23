import { RulePriority, RuleType, Rules } from '@api'

export const rules: Rules = {
    nodeAlerts: [
        {
            rulePk: 2,
            name: 'Battery SoC Dissipating (48hr)',
            className: 'BatterySocDissipatingRule',
            externalName: 'Battery is not recharging enough',
            periodHrs: 48,
            threshold: -0.15,
            visibility: 'EXTERNAL',
            priority: RulePriority.Minor,
            type: RuleType.NodeAlert
        },
        {
            rulePk: 3,
            name: 'No Data Received',
            className: 'NoDataReceivedRule',
            externalName: 'No data received from this pod',
            periodHrs: 12,
            threshold: 0,
            visibility: 'EXTERNAL',
            priority: RulePriority.Critical,
            type: RuleType.NodeAlert
        },
        {
            rulePk: 4,
            name: 'Power Thief',
            className: 'PowerThiefRule',
            externalName: 'Battery is discharging from stolen power or dying battery',
            periodHrs: 6,
            threshold: 0,
            visibility: 'EXTERNAL',
            priority: RulePriority.Minor,
            type: RuleType.NodeAlert
        },
        {
            rulePk: 6,
            name: 'Load Disabled Low Battery',
            className: 'LoadDisabledLowBatteryRule',
            externalName: 'Low battery caused loads to shut off',
            periodHrs: 3,
            threshold: 0,
            visibility: 'EXTERNAL',
            priority: RulePriority.Critical,
            type: RuleType.NodeAlert
        },
        {
            rulePk: 7,
            name: 'No Power Consumption',
            className: 'NoPowerConsumptionRule',
            externalName: "All load ports aren't being used",
            periodHrs: 24,
            threshold: 1,
            visibility: 'EXTERNAL',
            priority: RulePriority.Critical,
            type: RuleType.NodeAlert
        },
        {
            rulePk: 8,
            name: 'Float Not Hit',
            className: 'FloatNotHitRule',
            externalName: 'Full charge has not been hit',
            periodHrs: 120,
            threshold: 0,
            visibility: 'EXTERNAL',
            priority: RulePriority.Medium,
            type: RuleType.NodeAlert
        },
        {
            rulePk: 9,
            name: 'Panel Not Generating',
            className: 'PanelNotGeneratingRule',
            externalName: 'Panel is not producing power',
            periodHrs: 24,
            threshold: 0.5,
            visibility: 'EXTERNAL',
            priority: RulePriority.Critical,
            type: RuleType.NodeAlert
        },
        {
            rulePk: 10,
            name: 'Panel Underperforming',
            className: 'PanelUnderperformingRule',
            externalName: 'Panel is underperforming (producing less than its rating)',
            periodHrs: 120,
            threshold: 2,
            visibility: 'EXTERNAL',
            priority: RulePriority.Minor,
            type: RuleType.NodeAlert
        },
        {
            rulePk: 11,
            name: 'System Error',
            className: 'SystemErrorRule',
            externalName: 'Pod is experiencing critical errors',
            periodHrs: 3,
            threshold: 0,
            visibility: 'EXTERNAL',
            priority: RulePriority.Minor,
            type: RuleType.NodeAlert
        },
        {
            rulePk: 12,
            name: 'Disabled But Drawing Power',
            className: 'DisabledButDrawingPowerRule',
            externalName: "Load switch isn't working, battery is in danger",
            periodHrs: 3,
            threshold: 1,
            visibility: 'EXTERNAL',
            priority: RulePriority.Major,
            type: RuleType.NodeAlert
        },
        {
            rulePk: 14,
            name: 'Consumption Increase',
            className: 'ConsumptionIncreaseRule',
            externalName: 'Household energy usage has increased',
            periodHrs: 120,
            threshold: 0.3,
            visibility: 'EXTERNAL',
            priority: RulePriority.Minor,
            type: RuleType.NodeAlert
        },
        {
            rulePk: 24,
            name: 'Panel Hitting Max Capacity',
            className: 'PanelHittingMaxCapacityRule',
            externalName: 'Panel has reached max capacity',
            periodHrs: 120,
            threshold: 0.65,
            visibility: 'EXTERNAL',
            priority: RulePriority.Minor,
            type: RuleType.NodeAlert
        },
        {
            rulePk: 26,
            name: 'Sensors Disagree',
            className: 'SensorsDisagreeRule',
            externalName: 'Pod sensors are broken (inconsistent readings)',
            periodHrs: 3,
            threshold: 5,
            visibility: 'EXTERNAL',
            priority: RulePriority.Medium,
            type: RuleType.NodeAlert
        },
        {
            rulePk: 27,
            name: 'Negative Power Measurement',
            className: 'NegativePowerMeasurementRule',
            externalName: 'Pod sensors are broken (negative measurements)',
            periodHrs: 3,
            threshold: -1,
            visibility: 'EXTERNAL',
            priority: RulePriority.Minor,
            type: RuleType.NodeAlert
        },
        {
            rulePk: 29,
            name: 'Panel Error',
            className: 'PanelErrorRule',
            externalName: 'Pod is experiencing errors on the panel',
            periodHrs: 3,
            threshold: 0,
            visibility: 'EXTERNAL',
            priority: RulePriority.Minor,
            type: RuleType.NodeAlert
        },
        {
            rulePk: 30,
            name: 'Grid Error',
            className: 'GridErrorRule',
            externalName: 'Pod is experiencing errors on the grid',
            periodHrs: 3,
            threshold: 0,
            visibility: 'EXTERNAL',
            priority: RulePriority.Minor,
            type: RuleType.NodeAlert
        },
        {
            rulePk: 31,
            name: 'Load Error',
            className: 'LoadErrorRule',
            externalName: 'Pod is experiencing errors on load ports',
            periodHrs: 3,
            threshold: 0,
            visibility: 'EXTERNAL',
            priority: RulePriority.Minor,
            type: RuleType.NodeAlert
        }
    ],
    nodeInsights: [
        {
            rulePk: 19,
            name: 'Check Battery',
            className: 'CheckBatteryInsight',
            externalName: 'Check Battery',
            periodHrs: 0,
            threshold: 0,
            visibility: 'EXTERNAL',
            priority: RulePriority.Minor,
            type: RuleType.NodeInsight
        },
        {
            rulePk: 20,
            name: 'Check Pod',
            className: 'CheckPodInsight',
            externalName: 'Check Pod',
            periodHrs: 0,
            threshold: 0,
            visibility: 'INTERNAL',
            priority: RulePriority.Minor,
            type: RuleType.NodeInsight
        },
        {
            rulePk: 21,
            name: 'Clean / Relocate Panel',
            className: 'CleanRelocatePanelInsight',
            externalName: 'Clean / Relocate Panel',
            periodHrs: 0,
            threshold: 0,
            visibility: 'EXTERNAL',
            priority: RulePriority.Minor,
            type: RuleType.NodeInsight
        },
        {
            rulePk: 25,
            name: 'Increase Panel Capacity',
            className: 'IncreasePanelCapacityInsight',
            externalName: 'Increase Panel Capacity',
            periodHrs: 0,
            threshold: 0,
            visibility: 'INTERNAL',
            priority: RulePriority.Minor,
            type: RuleType.NodeInsight
        },
        {
            rulePk: 28,
            name: 'Replace Pod',
            className: 'ReplacePodInsight',
            externalName: 'Replace Pod',
            periodHrs: 0,
            threshold: 0,
            visibility: 'EXTERNAL',
            priority: RulePriority.Major,
            type: RuleType.NodeInsight
        },
        {
            rulePk: 32,
            name: 'Fix Faulty Wiring - Load',
            className: 'FixFaultyWiringLoadInsight',
            externalName: 'Fix Faulty Wiring - Load',
            periodHrs: 0,
            threshold: 0,
            visibility: 'EXTERNAL',
            priority: RulePriority.Minor,
            type: RuleType.NodeInsight
        },
        {
            rulePk: 33,
            name: 'Fix Faulty Wiring - Solar',
            className: 'FixFaultyWiringSolarInsight',
            externalName: 'Fix Faulty Wiring - Solar',
            periodHrs: 0,
            threshold: 0,
            visibility: 'EXTERNAL',
            priority: RulePriority.Minor,
            type: RuleType.NodeInsight
        }
    ],
    villageAlerts: [
        {
            rulePk: 13,
            name: 'Village Wide No Data Received',
            className: 'VillageWideNoDataReceivedRule',
            externalName: 'No data received from > 75% of homes',
            periodHrs: 12,
            threshold: 0.75,
            visibility: 'EXTERNAL',
            priority: RulePriority.Major,
            type: RuleType.VillageAlert
        },
        {
            rulePk: 17,
            name: 'Village Wide Panel Underperforming',
            className: 'VillageWidePanelUnderperformingRule',
            externalName: 'Panel is underperforming, for > 75% of homes',
            periodHrs: 12,
            threshold: 0.75,
            visibility: 'EXTERNAL',
            priority: RulePriority.Minor,
            type: RuleType.VillageAlert
        },
        {
            rulePk: 23,
            name: 'Village Wide Float Not Hit',
            className: 'VillageWideFloatNotHitRule',
            externalName: 'Full charge has not been hit, for > 75% of homes',
            periodHrs: 0,
            threshold: 0.75,
            visibility: 'EXTERNAL',
            priority: RulePriority.Minor,
            type: RuleType.VillageAlert
        }
    ],
    villageInsights: [
        {
            rulePk: 18,
            name: 'Cell Network Outage',
            className: 'CellNetworkOutageInsight',
            externalName: 'Cell Network Outage',
            periodHrs: 0,
            threshold: 0,
            visibility: 'EXTERNAL',
            priority: RulePriority.Minor,
            type: RuleType.VillageInsight
        },
        {
            rulePk: 22,
            name: 'Enable Generator',
            className: 'EnableGeneratorInsight',
            externalName: 'Enable Generator',
            periodHrs: 0,
            threshold: 0,
            visibility: 'INTERNAL',
            priority: RulePriority.Minor,
            type: RuleType.VillageInsight
        }
    ]
}
