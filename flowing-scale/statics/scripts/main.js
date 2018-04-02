var mainCanvas = new JCanvas(document.getElementById('bgcanvas'), {
    showFPS: true
});
mainCanvas.addPainter(painterGroup.background);
mainCanvas.addPainter(painterGroup.hexagon);
mainCanvas.addPainter(painterGroup.polygon);
mainCanvas.addPainter(painterGroup.cover);
var testData = (function() {
    var data = [],
        length = 20;
    while (length--) {
        data.push({
            clusterId: 'clusterId0' + length,
            clusterName: 'EAMDB',
            appName: 'sz1',
            categoryId: 'xxx',
            categoryName: 'categoryName',
            status: 'OK',
            delay: "3000ms",
            clusterScoreTime: "06-14 15:44",
            clusterScore: length
        })
    };
    data.splice(3, 0, {
        clusterId: 'fc26b12292564a47bff6b1ffabbaa852',
        clusterName: 'CRITICAL',
        appName: 'sz1',
        categoryId: 'xxx',
        categoryName: 'categoryName',
        status: 'CRITICAL',
        delay: "1240ms",
        clusterScoreTime: "06-14 15:44",
        clusterScore: "58"
    })
    data.splice(7, 0, {
        clusterId: 'clusterId002',
        clusterName: 'EA01',
        appName: 'sz1',
        categoryId: 'xxx',
        categoryName: 'categoryName',
        status: 'WARNING',
        delay: "4800ms",
        clusterScoreTime: "06-14 15:44",
        clusterScore: "29"
    })
    data.splice(10, 0, {
        clusterId: 'clusterId003',
        clusterName: 'TGFADB',
        appName: 'sz1',
        categoryId: 'xxx',
        categoryName: 'categoryName',
        status: 'WARNING',
        delay: "8347ms",
        clusterScoreTime: "06-14 15:44",
        clusterScore: "86"
    });
    return data;
})();
painterGroup.polygon.clearData();
painterGroup.polygon.addData(testData);
