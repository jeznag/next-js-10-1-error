/* eslint-disable */
import { ThemeType, grommet } from 'grommet'
import { deepMerge } from 'grommet/utils'
import { css } from 'styled-components'

const checkboxCheckStyle = css`
  background-color: #15d887;
`

export const COLOURS = {
    "brand": {
        "dark": "#15d887",
        "light": "#001529"
    },
    "background": {
        "dark": "#111111",
        "light": 'white'
    },
    "background-back": {
        "dark": "#111111",
        "light": "#EEEEEE"
    },
    "background-front": {
        "dark": "#222222",
        "light": 'white'
    },
    "background-contrast": {
        "dark": "#FFFFFF11",
        "light": "#11111111"
    },
    "text": {
        "dark": "#EEEEEE",
        "light": "#333333"
    },
    "text-strong": {
        "dark": 'white',
        "light": "#000000"
    },
    "text-weak": {
        "dark": "#CCCCCC",
        "light": "#444444"
    },
    "text-xweak": {
        "dark": "#999999",
        "light": "#666666"
    },
    "border": {
        "dark": "#444444",
        "light": "#CCCCCC"
    },
    "control": "brand",
    "active-background": "background-contrast",
    "active-text": "text-strong",
    "selected-background": "brand",
    "selected-text": "text-strong",
    "status-critical": "#FF4040",
    "status-warning": "#FFAA15",
    "status-ok": "#00C781",
    "status-unknown": "#CCCCCC",
    "status-disabled": "#CCCCCC",
    "graph-0": "brand",
    "graph-1": "status-warning",
    "focus": "#15d887",
    "okra-green": '#15d887'
}

export const grommetTheme: ThemeType = deepMerge(grommet, {
    "global": {
        "colors": COLOURS,
        "font": {
            "family": "Helvetica",
            "size": "18px",
            "height": "24px",
            "maxWidth": "432px"
        },
        "active": {
            "background": "active-background",
            "color": "active-text"
        },
        "hover": {
            "background": "active-background",
            "color": "active-text"
        },
        "selected": {
            "background": "selected-background",
            "color": "selected-text"
        },
        "control": {
            "border": {
                "radius": "0px"
            }
        },
        "drop": {
            "border": {
                "radius": "0px"
            }
        },
        "borderSize": {
            "xsmall": "1px",
            "small": "2px",
            "medium": "4px",
            "large": "12px",
            "xlarge": "24px"
        },
        "breakpoints": {
            "small": {
                "value": 768,
                "borderSize": {
                    "xsmall": "1px",
                    "small": "2px",
                    "medium": "4px",
                    "large": "6px",
                    "xlarge": "12px"
                },
                "edgeSize": {
                    "none": "0px",
                    "hair": "1px",
                    "xxsmall": "2px",
                    "xsmall": "3px",
                    "small": "6px",
                    "medium": "12px",
                    "large": "24px",
                    "xlarge": "48px"
                },
                "size": {
                    "xxsmall": "24px",
                    "xsmall": "48px",
                    "small": "96px",
                    "medium": "192px",
                    "large": "384px",
                    "xlarge": "768px",
                    "full": "100%"
                }
            },
            "medium": {
                "value": 1536
            },
            "large": {}
        },
        "edgeSize": {
            "none": "0px",
            "hair": "1px",
            "xxsmall": "3px",
            "xsmall": "6px",
            "small": "12px",
            "medium": "24px",
            "large": "48px",
            "xlarge": "96px",
            "responsiveBreakpoint": "small"
        },
        "input": {
            "padding": "12px",
            "weight": 600
        },
        "spacing": "24px",
        "size": {
            "xxsmall": "48px",
            "xsmall": "96px",
            "small": "192px",
            "medium": "384px",
            "large": "768px",
            "xlarge": "1152px",
            "xxlarge": "1536px",
            "full": "100%"
        }
    },
    "accordion": {
        "border": false
    },
    "chart": {},
    "diagram": {
        "line": {}
    },
    "meter": {},
    "button": {
        "border": {
            "width": "2px",
            "radius": "14px"
        },
        "padding": {
            "vertical": "4px",
            "horizontal": "22px"
        },
        "size": {
            "small": {
                "border": {
                    "radius": "14px"
                }
            },
            "medium": {
                "border": {
                    "radius": "14px"
                }
            },
            "large": {
                "border": {
                    "radius": "14px"
                }
            }
        }
    },
    "checkBox": {
        "check": {
            "radius": "14px"
        },
        "toggle": {
            "radius": "14px",
            "size": "48px",
            "extend": ({ checked }: { checked: boolean }) => `
                ${checked && checkboxCheckStyle}
            `,
        },
        "size": "24px",
    },
    "calendar": {
        "small": {
            "fontSize": "12px",
            "lineHeight": 1.375,
            "daySize": "27.43px"
        },
        "medium": {
            "fontSize": "18px",
            "lineHeight": 1.45,
            "daySize": "54.86px"
        },
        "large": {
            "fontSize": "36px",
            "lineHeight": 1.11,
            "daySize": "109.71px"
        }
    },
    "clock": {
        "analog": {
            "hour": {
                "width": "8px",
                "size": "24px"
            },
            "minute": {
                "width": "4px",
                "size": "12px"
            },
            "second": {
                "width": "3px",
                "size": "9px"
            },
            "size": {
                "small": "72px",
                "medium": "96px",
                "large": "144px",
                "xlarge": "216px",
                "huge": "288px"
            }
        },
        "digital": {
            "text": {
                "xsmall": {
                    "size": "6px",
                    "height": 1.5
                },
                "small": {
                    "size": "12px",
                    "height": 1.43
                },
                "medium": {
                    "size": "18px",
                    "height": 1.375
                },
                "large": {
                    "size": "24px",
                    "height": 1.167
                },
                "xlarge": {
                    "size": "30px",
                    "height": 1.1875
                },
                "xxlarge": {
                    "size": "42px",
                    "height": 1.125
                }
            }
        }
    },
    "heading": {
        "level": {
            "1": {
                "small": {
                    "size": "42px",
                    "height": "48px",
                    "maxWidth": "1008px"
                },
                "medium": {
                    "size": "66px",
                    "height": "72px",
                    "maxWidth": "1584px"
                },
                "large": {
                    "size": "114px",
                    "height": "120px",
                    "maxWidth": "2736px"
                },
                "xlarge": {
                    "size": "162px",
                    "height": "168px",
                    "maxWidth": "3888px"
                }
            },
            "2": {
                "small": {
                    "size": "36px",
                    "height": "42px",
                    "maxWidth": "864px"
                },
                "medium": {
                    "size": "54px",
                    "height": "60px",
                    "maxWidth": "1296px"
                },
                "large": {
                    "size": "72px",
                    "height": "78px",
                    "maxWidth": "1728px"
                },
                "xlarge": {
                    "size": "90px",
                    "height": "96px",
                    "maxWidth": "2160px"
                }
            },
            "3": {
                "small": {
                    "size": "30px",
                    "height": "36px",
                    "maxWidth": "720px"
                },
                "medium": {
                    "size": "42px",
                    "height": "48px",
                    "maxWidth": "1008px"
                },
                "large": {
                    "size": "54px",
                    "height": "60px",
                    "maxWidth": "1296px"
                },
                "xlarge": {
                    "size": "66px",
                    "height": "72px",
                    "maxWidth": "1584px"
                }
            },
            "4": {
                "small": {
                    "size": "24px",
                    "height": "30px",
                    "maxWidth": "576px"
                },
                "medium": {
                    "size": "30px",
                    "height": "36px",
                    "maxWidth": "720px"
                },
                "large": {
                    "size": "36px",
                    "height": "42px",
                    "maxWidth": "864px"
                },
                "xlarge": {
                    "size": "42px",
                    "height": "48px",
                    "maxWidth": "1008px"
                }
            },
            "5": {
                "small": {
                    "size": "15px",
                    "height": "21px",
                    "maxWidth": "360px"
                },
                "medium": {
                    "size": "15px",
                    "height": "21px",
                    "maxWidth": "360px"
                },
                "large": {
                    "size": "15px",
                    "height": "21px",
                    "maxWidth": "360px"
                },
                "xlarge": {
                    "size": "15px",
                    "height": "21px",
                    "maxWidth": "360px"
                }
            },
            "6": {
                "small": {
                    "size": "12px",
                    "height": "18px",
                    "maxWidth": "288px"
                },
                "medium": {
                    "size": "12px",
                    "height": "18px",
                    "maxWidth": "288px"
                },
                "large": {
                    "size": "12px",
                    "height": "18px",
                    "maxWidth": "288px"
                },
                "xlarge": {
                    "size": "12px",
                    "height": "18px",
                    "maxWidth": "288px"
                }
            }
        }
    },
    "paragraph": {
        "small": {
            "size": "15px",
            "height": "21px",
            "maxWidth": "360px"
        },
        "medium": {
            "size": "18px",
            "height": "24px",
            "maxWidth": "432px"
        },
        "large": {
            "size": "24px",
            "height": "30px",
            "maxWidth": "576px"
        },
        "xlarge": {
            "size": "30px",
            "height": "36px",
            "maxWidth": "720px"
        },
        "xxlarge": {
            "size": "42px",
            "height": "48px",
            "maxWidth": "1008px"
        }
    },
    // @ts-ignore
    "text": {
        "xsmall": {
            "size": "12px",
            "height": "18px",
            "maxWidth": "288px"
        },
        "small": {
            "size": "15px",
            "height": "21px",
            "maxWidth": "360px"
        },
        "medium": {
            "size": "18px",
            "height": "24px",
            "maxWidth": "432px"
        },
        "large": {
            "size": "24px",
            "height": "30px",
            "maxWidth": "576px"
        },
        "xlarge": {
            "size": "30px",
            "height": "36px",
            "maxWidth": "720px"
        },
        "xxlarge": {
            "size": "42px",
            "height": "48px",
            "maxWidth": "1008px"
        }
    },
    "layer": {
        "background": {
            "dark": "#111111",
            "light": 'white'
        }
    }
})
