declare const functions: {
    createInstance: (definition: any, options: any) => {
        definition: any;
        parameters: any[];
        added: any;
    };
    updateParameter: (instance: any, strValue: any, updateIndex: any) => void;
    getDefinition: (name: any) => any;
    getCategories: () => {
        Aggregate: any[];
        RawAggregate: any[];
        Filter: any[];
        Derivative: any[];
        Time: any[];
        MovingWindow: any[];
        Rounding: any[];
        Math: any[];
        Interpolate: any[];
    };
    queryString: (wfFunction: any, baseExpression: any) => string;
};
export default functions;
