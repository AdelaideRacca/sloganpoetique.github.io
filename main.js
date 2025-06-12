var originDiv;
var rulesDiv;
var addLink;
var exportLink;
var importLink;
var importFile;
var generateLink;
var clearLink;
var resultDiv;
var ruleTemplate;


document.addEventListener("DOMContentLoaded",start);


function start() {
    originDiv = document.getElementById("origin");
    rulesDiv = document.getElementById("rules");
    addLink = document.getElementById("add");
    exportLink = document.getElementById("export");
    importLink = document.getElementById("import");
    importFile = document.getElementById("input");
    generateLink = document.getElementById("generate");
    clearLink = document.getElementById("clear");
    resultDiv = document.getElementById("result");

    ruleTemplate = _.template( document.getElementById("addRule").innerHTML );

    addLink.addEventListener("click",addLinkFn);
    exportLink.addEventListener("click",exportLinkFn);
    importLink.addEventListener("click",importLinkFn);
    importFile.addEventListener("change",importFileFn);
    generateLink.addEventListener("click",generateLinkFn);
    clearLink.addEventListener("click",clearLinkFn);
    originDiv.addEventListener("input",generate);

    var grammar = localStorage.getItem("grammar");
    if(grammar) parseJSON(grammar);
        
}

function addLinkFn(e) {
    e.preventDefault();
    var div = document.createElement('div');
    div.className = "rule";
    div.innerHTML = ruleTemplate({title:"",els:""});
    div.addEventListener("input",generate);
    rulesDiv.appendChild(div);
    div.getElementsByClassName("close")[0].addEventListener("click",closeRule);
}

function closeRule(e){
    e.preventDefault();
    var rule = e.currentTarget.parentNode;
    console.log(rule);

    if(rule.getElementsByClassName("elements")[0].value.trim() != "") {
        console.log("confirm");
        if(!confirm("Etes-vous sûr de vouloir supprimer cette règle et tout ce qu'elle contient ?")) return;
    }
    
    rulesDiv.removeChild(rule);
    generate();
}

function exportLinkFn(e){
    e.preventDefault();
    var grammar = generate();
    var data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(grammar));
    var fakeLink = document.createElement('a');
    fakeLink.setAttribute("href", data );
    fakeLink.setAttribute("download", "combinatoire_regles.json");
    fakeLink.click();
}

function importLinkFn(e){
    e.preventDefault();
    if(confirm("Importer remplace tout ce qui est déjà  inscrit, assurez-vous d'avoir exporter votre travail en cours avant.")) importFile.click();
}

function importFileFn(e){
    if(this.files.length && this.files[0].size){
        this.files[0].text().then(function(rep){
            parseJSON(rep);
        });
    }
}

function generateLinkFn(e) {
    e.preventDefault();
    var grammar = generate();

    var p = document.createElement("p");
    p.innerHTML = tracery.createGrammar(grammar).flatten('#origin#');

    resultDiv.appendChild(p);

    window.scrollTo(0, document.body.scrollHeight);;
}

function generate() {
    var grammar = {};
    grammar.origin = originDiv.value.replace("\n","<br>");

    var rules = document.getElementsByClassName("rule");
    var title,els, rule;
    for (var i=0; i<rules.length;i++){
        rule = rules[i];
        title = rule.getElementsByClassName("name")[0].value.trim();
        els = rule.getElementsByClassName("elements")[0].value.split("\n");

        if(title && els.length){
            grammar[title] = els;
        }
    }

    localStorage.setItem("grammar", JSON.stringify(grammar));

    return grammar;
}

function parseJSON(txt){
    var grammar = JSON.parse(txt);
    var divs = rulesDiv.getElementsByClassName("rule");
    for (var i=divs.length-1;i>=0;i--){
        rulesDiv.removeChild(divs[i]);
    }

    originDiv.value = grammar.origin.replace("<br>","\n");
    for (const prop in grammar) {
        console.log("prop",prop);
        if(prop != "origin"){
            var div = document.createElement('div');
            div.className = "rule";
            div.innerHTML = ruleTemplate({title:prop,els:grammar[prop].join("\n")});
            div.addEventListener("input",generate);
            rulesDiv.appendChild(div);
            div.getElementsByClassName("close")[0].addEventListener("click",closeRule);
        }
    }
}

function clearLinkFn(e){
    e.preventDefault();
    resultDiv.innerHTML = "";
}
