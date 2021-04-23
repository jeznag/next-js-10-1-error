type JSONPrimitive = string | string[] | number | boolean | null | undefined
type JSONArray = JSONObject[]
type JSONObject = { readonly [member: string]: JSONPrimitive | JSONType | JSONArray }
export type JSONType = JSONObject | JSONObject[]
