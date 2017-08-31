import {FeatureGroup, Polyline, extend} from 'leaflet';

/*
 * MultiOptionsPolyline is a MultiPolyLine which parts can be styled differently.
 * options: {
 *     multiOptions: {
 *         optionIdxFn: function (latLng, prevLatLng, index, allLatlngs),
 *         fnContext: ctx, // the context to call optionIdxFn (optional)
 *         options: [{}, {}, {}] or function, // options for the index returned by optionIdxFn. If supplied with a function then it will be called with the index
 *         copyBaseOptions: true
 *     },
 *     // other options from Polyline
 * }
 */
export const MultiOptionsPolyline = FeatureGroup.extend({

    initialize: function (latlngs, options) {
        const copyBaseOptions = options.multiOptions.copyBaseOptions;

        this._layers = {};
        this._options = options;
        if (copyBaseOptions === undefined || copyBaseOptions) {
            this._copyBaseOptions();
        }

        this.setLatLngs(latlngs);
    },

    _copyBaseOptions: function () {
        const multiOptions = this._options.multiOptions,
            optionsArray = multiOptions.options,
            len = optionsArray.length;

        let baseOptions;

        baseOptions = extend({}, this._options);
        delete baseOptions.multiOptions;

        for (let i = 0; i < len; ++i) {
            optionsArray[i] = extend({}, baseOptions, optionsArray[i]);
        }
    },

    setLatLngs: function (latlngs) {
        const len = latlngs.length,
            multiOptions = this._options.multiOptions,
            optionIdxFn = multiOptions.optionIdxFn,
            fnContext = multiOptions.fnContext || this;

        let prevOptionIdx,
            segmentLatlngs;

        this._originalLatlngs = latlngs;

        this.eachLayer(function (layer) {
            this.removeLayer(layer);
        }, this);

        for (let i = 1; i < len; ++i) {
            const optionIdx = optionIdxFn.call(
                fnContext, latlngs[i], latlngs[i - 1], i, latlngs);

            if (i === 1) {
                segmentLatlngs = [latlngs[0]];
                prevOptionIdx = optionIdxFn.call(fnContext, latlngs[0], latlngs[0], 0, latlngs);
            }

            segmentLatlngs.push(latlngs[i]);

            // is there a change in options or is it the last point?
            if (prevOptionIdx !== optionIdx || i === len - 1) {
                // Check if options is a function or an array
                if (typeof multiOptions.options === "function") {
                    this.addLayer(new Polyline(segmentLatlngs, multiOptions.options(prevOptionIdx)));
                } else {
                    this.addLayer(new Polyline(segmentLatlngs, multiOptions.options[prevOptionIdx]));
                }

                prevOptionIdx = optionIdx;
                segmentLatlngs = [latlngs[i]];
            }
        }

        return this;
    },

    getLatLngs: function () {
        return this._originalLatlngs;
    },

    getLatLngsSegments: function () {
        const latlngs = [];

        this.eachLayer(function (layer) {
            latlngs.push(layer.getLatLngs());
        });

        return latlngs;
    }
});

export const multiOptionsPolyline = function (latlngs, options) {
    return new MultiOptionsPolyline(latlngs, options);
};
