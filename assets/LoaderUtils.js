// Minimal LoaderUtils implementation for GLTFLoader.js
export const LoaderUtils = {
    extractUrlBase: function ( url ) {
        const index = url.lastIndexOf( '/' );
        if ( index === - 1 ) return './';
        return url.slice( 0, index + 1 );
    },
    resolveURL: function ( url, path ) {
        // If url is absolute, return as is
        if (/^(https?:)?\/\//i.test(url)) return url;
        // If path is absolute, join with url
        if (path && /^(https?:)?\/\//i.test(path)) {
            return path.replace(/\/$/, '') + '/' + url.replace(/^\//, '');
        }
        // Otherwise, join path and url
        return (path || './') + url;
    }
};
