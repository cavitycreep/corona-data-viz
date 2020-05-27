export default function(mergedCounties, fileName) {
    let csvContent = "data:text/csv;charset=utf-8,"
        + Object.keys(mergedCounties[0]).join(",") + "\n"
        + mergedCounties.map(e => Object.values(e).join(",")).join("\n");
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link); // Required for FF
    link.click();
}
