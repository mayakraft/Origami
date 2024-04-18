export { circleDef as default };
declare namespace circleDef {
    namespace circle {
        function args(a: any, b: any, c: any, d: any): any[];
        let methods: {
            appendTo: (element: any, parent: any) => any;
            removeChildren: (element: any) => any;
            setAttributes: (element: any, attrs: any) => any;
            clearTransform: (el: any) => any;
            radius: (el: any, r: any) => any;
            setRadius: (el: any, r: any) => any;
            origin: (el: any, a: any, b: any) => any;
            setOrigin: (el: any, a: any, b: any) => any;
            center: (el: any, a: any, b: any) => any;
            setCenter: (el: any, a: any, b: any) => any;
            position: (el: any, a: any, b: any) => any;
            setPosition: (el: any, a: any, b: any) => any;
        };
    }
}