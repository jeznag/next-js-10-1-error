import { theme } from './global-styles'

type GlobalTheme = {
    primaryColor: string
    infoColor: string
    successColor: string
    processingColor: string
    errorColor: string
    highlightColor: string
    warningColor: string
    normalColor: string
    backgroundColor: string
    darkColor: string
    textColor: string
    textColorSecondary: string
    defaultFeatherColor: string
    borderBase: string
    borderSplit: string
    fadeBorderColor: string
}

const harvestTheme = theme as GlobalTheme

export class HarvestColor {
    public static readonly Primary = harvestTheme.primaryColor
    public static readonly Info = harvestTheme.infoColor
    public static readonly Success = harvestTheme.successColor
    public static readonly Processing = harvestTheme.processingColor
    public static readonly Error = harvestTheme.errorColor
    public static readonly Highlight = harvestTheme.highlightColor
    public static readonly Warning = harvestTheme.warningColor
    public static readonly Normal = harvestTheme.normalColor
    public static readonly Background = harvestTheme.backgroundColor
    public static readonly Dark = harvestTheme.darkColor
    public static readonly Text = harvestTheme.textColor
    public static readonly TextSecondary = harvestTheme.textColorSecondary
    public static readonly Feather = harvestTheme.defaultFeatherColor
    public static readonly BorderBase = harvestTheme.borderBase
    public static readonly BorderSplit = harvestTheme.borderSplit
    public static readonly FadeBorderColor = harvestTheme.fadeBorderColor
}
