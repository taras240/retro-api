const formatFunctions = (string, functions = {}, keys) => {
    return string.replace(/\{\{(\w+)(?:\((.*?)\))?\}\}/g, (_, fnName, args) => {
        const fn = functions[fnName];

        if (typeof fn !== "function") {
            return `{{${fnName}}}`;
        }

        const parsedArgs = args
            ? args.split(",").map(arg => {
                const key = arg.trim();
                return key in keys ? keys[key] : key;
            })
            : [];

        return fn(...parsedArgs);
    });
};

export const formatText = (string, keys = {}, fnKeys) => {
    if (fnKeys) {
        string = formatFunctions(string, fnKeys, keys);
    }

    return string.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        const value = keys[key];
        return typeof value === "function" ? value() : value ?? "";
    });
};