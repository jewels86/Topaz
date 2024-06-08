/**
 * Returns the arguments passed into the widget.
 */
export function getWidgetArguments() {
    return Object.fromEntries([...new URLSearchParams(document.location.href.split('?')[1])]);
}
/**
 * Transforms values to the type given.
 * @param {string} value 
 * @param {string} type 
 */
export function transform(value, type) {
    switch (type) {
        case 'array':
            return value.split(',');

        case 'number':
            return Number(value);
        
        case 'object':
            return JSON.parse(value);
    
        default:
            return value;
    }
}