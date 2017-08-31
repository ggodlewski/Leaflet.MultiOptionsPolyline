import {FeatureGroup, LatLng, MarkerOptions, PolylineOptions} from 'leaflet';

declare module 'Leaflet.MultiOptionsPolyline' {
    type PolylineOptionsFn = (optionIdx: number) => PolylineOptions;

    interface MultiOptions {
        optionIdxFn: (latLng, prevLatLng, index, allLatlngs) => number;
        // options for the index returned by optionIdxFn. If supplied with a function then it will be called with the index
        options: PolylineOptions[] | PolylineOptionsFn;
        // the context to call optionIdxFn (optional)
        fnContext?: any;
        copyBaseOptions?: boolean;
    }

    interface MultiOptionsPolylineOptions extends MarkerOptions {
        multiOptions: MultiOptions;
    }

    interface MultiOptionsPolyline extends FeatureGroup {
        initialize(latlng: LatLng[], options?: MultiOptionsPolylineOptions): void;
        setLatLngs(latlngs: LatLng[]): MultiOptionsPolyline;
        getLatLngs(): LatLng[];
        getLatLngsSegments(): LatLng[];
    }

    function multiOptionsPolyline(latlng: LatLng[], options?: MultiOptionsPolylineOptions): MultiOptionsPolyline;
}
