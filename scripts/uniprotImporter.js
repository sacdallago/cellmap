// Parallelize
const numCPUs = require('os').cpus().length;
const cluster = require('cluster');
const mappingSource = require(__dirname + "/../" + 'data/' + 'proteinMapping.json');

if (cluster.isMaster) {
    var step = Math.ceil(mappingSource.length/numCPUs);

    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        var from = i*step;
        var to = ((i*step)+step > mappingSource.length ? mappingSource.length : (i*step)+step);
        var worker = cluster.fork({
            from: from,
            to: to
        });
        console.log("Spwaning worker " + worker.id);
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} ended`);
    });
} else {
    const context = require(__dirname + "/../" + "index").connect(function(context){
        var promises = [];

        const mappingDao = context.component('daos').module('mappings');
        const now = Date.now();

        if(mappingSource){
            mappingSource.slice(process.env.from, process.env.to).forEach(function(element){
                var deferred = context.promises.defer();
                promises.push(deferred.promise);

                /* Example of JSON:
                    {"val0":"P31946","val1":"1433B_HUMAN","val2":"7529","val3":"NP_003395.1; NP_647539.1","val4":"4507949; 377656701; 67464627; 377656702; 78101741; 67464628; 1345590; 21328448","val5":"2BQ0:A; 2BQ0:B; 2C23:A; 4DNK:A; 4DNK:B","val6":"GO:0005737; GO:0030659; GO:0005829; GO:0070062; GO:0005925; GO:0042470; GO:0016020; GO:0005739; GO:0005634; GO:0048471; GO:0017053; GO:0019899; GO:0042826; GO:0051219; GO:0050815; GO:0019904; GO:0003714; GO:0000186; GO:0006915; GO:0007411; GO:0051220; GO:0007173; GO:0038095; GO:0008543; GO:0010467; GO:0035329; GO:0045087; GO:0008286; GO:0097193; GO:0000165; GO:0061024; GO:0035308; GO:0045892; GO:0048011; GO:0043085; GO:1900740; GO:0012501; GO:0051291; GO:0006605; GO:0007265; GO:0043488; GO:0007264; GO:0006367; GO:0048010; GO:0016032","val7":"UniRef100_P31946","val8":"UniRef90_P31946","val9":"UniRef50_P31946","val10":"UPI000013C714","val11":"S34755","val12":"9606","val13":"601289","val14":"Hs.643544","val15":"8515476; 14702039; 11780052; 15489334; 12665801; 11427721; 15454081; 15159416; 15696159; 17081065; 17974916; 17717073; 18249187; 19172738; 19592491; 19690332; 19608861; 21269460; 21224381; 22814378; 23938468; 24636949; 24275569; 26047703; 25944712; 17085597; 21248752","val16":"X57346; AK292717; AL008725; CH471077; CH471077; CH471077; BC001359","val17":"CAA40621.1; BAF85406.1; CAA15497.1; EAW75893.1; EAW75894.1; EAW75896.1; AAH01359.1","val18":"ENSG00000166913","val19":"ENST00000353703; ENST00000372839","val20":"ENSP00000300161; ENSP00000361930","val21":"11996670; 12364343; 12437930; 12468542; 12482592; 12582162; 12618428; 12669242; 14680818; 15022330; 15389601; 15726117; 16166738; 17098443; 17229891; 17531190; 18094049; 19173300; 19360691; 19558434; 19821490; 20070120; 20381070; 20388496; 21147917; 21262972; 21396404; 21553213; 21598387; 21708191; 21935479; 21948273; 21972092; 22125622; 22278744; 23053962; 24038028; 24269229; 24555778; 25228695; 26260846; 10409742; 10713667; 10775038; 10840038; 10862767; 10958686; 11157475; 11279064; 11313964; 11555644; 11697890; 11886850; 12383250; 12438239; 12620389; 12871587; 12963375; 14651979; 14679215; 14688255; 14701738; 14743216; 15023544; 15057270; 15173315; 15324660; 15629149; 15684389; 15691829; 15860732; 15883195; 16282323; 16511560; 16581770; 16672054; 16672277; 16717153; 16775625; 16868027; 16959763; 17170118; 17314511; 17353931; 17461779; 17500595; 17620599; 17923693; 17965023; 17979178; 18029035; 18160719; 18308725; 18372248; 18458160; 18460465; 18626018; 18647389; 18771726; 19129461; 19135240; 19270694; 19329994; 19595761; 19615732; 19640509; 19691494; 19725029; 19738201; 19805454; 19860830; 19955570; 20000738; 20048001; 20169078; 20195357; 20363754; 20562859; 20598904; 20618440; 20639859; 20642453; 20936779; 21112954; 21278420; 21282530; 21565611; 21706016; 21771788; 21900206; 21903422; 21911578; 22078878; 22190034; 22304920; 22593156; 22623428; 22677168; 22810585; 23602568; 23622247; 23752268; 24255178; 24366813; 24510904; 24658140; 24947832; 25036637; 25277244; 25609649; 25852190; 26496610; 26514267; 26638075; 7644510; 7882972; 7935795; 8085158; 9341175; 9581554"},
                    */

                var newobj = {
                    uniprotId: element.val0,
                    entryName: element.val1,
                    geneId: element.val2,
                    createdAt: now,
                    updatedAt: now
                };

                deferred.resolve(newobj);
                console.log('Prepared ' + newobj.uniprotId);
            });
        }

        context.promises.all(promises).then(function(results) {
            mappingDao.bulkInsert(promises).then(function(result){
                console.log("[Mappings] Inserted ", process.env.from, process.env.to);
                console.log("Finished.");
                process.exit();
            }, function(error){
                console.error("[Mappings] Error: " + error, "With: ", process.env.from, process.env.to);
                console.log("Finished.");
                process.exit();
            });
        });

    });
}