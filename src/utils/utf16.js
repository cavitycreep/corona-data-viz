export const encodeUTF16Array = (array) => {
    return array.map((a) => encodeUTF16String(JSON.stringify(a)));
}

export const encodeUTF16String = (str) => {
    var buf = new SharedArrayBuffer(str.length*2);
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return bufView;
};

export const decodeUTF16Array = (array) => {
    return array.map((a) => JSON.parse(decodeUTF16String(a)));
}

export const decodeUTF16String = (arr) => {
    var str = "";
    for (var i=0; i < arr.length; i++) {
        str += String.fromCharCode(arr[i])
    }
    return str;
};
