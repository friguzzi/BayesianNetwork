//esempio per debug NODES
//{id: 1, label: 'Node 1', domain: 'T,F,G', title: "", color:{background:"",border:"black"},},
//{id: 2, label: 'Node 2', domain: 'T,F', title: "", color:{background:"",border:"black"},},
//{id: 3, label: 'Node 3', domain: 'T,F,G', title: "", color:{background:"",border:"black"},},
//{id: 4, label: 'Node 4', domain: 'T,F', title: "", color:{background:"",border:"black"},},
//{id: 5, label: 'Node 5', domain: 'T,F', title: "", color:{background:"",border:"black"},}

//esempio per debug EDGES
//{id: 1, from: 1, to: 3, arrows:'to'},
//{id: 2, from: 1, to: 2, arrows:'to'},
//{id: 3, from: 4, to: 2, arrows:'to'},
//{id: 4, from: 2, to: 5, arrows:'to'},
//{id: 5, from: 4, to: 5, arrows:'to'}

//creo un array di nodi
var nodes = new vis.DataSet([]);
//creo un array di archi 
var edges = new vis.DataSet([]);
//mostro il tutto a video tramite un canvas nel html
var container = document.getElementById('graph');
//inizializzo data
var data = {
	nodes: nodes,
	edges: edges
};
var options = {};
//inizializzo la rete
var network = new vis.Network(container, data, options);

//evento onclick
network.on( 'click', function(properties) {

	var option_selected = $("#name_choice").text(); 

	if(option_selected === "Set Properties")
	{
        //grafica 
        $("#error_dialog").hide();
        $("#success").hide(); 

        var ids = properties.nodes;
        if(ids.length===0)
        	return;
        else
        {
        	var clickedNodes = nodes.get(ids);
        	var label_selected=clickedNodes[0].label;
        	var domain_selected=clickedNodes[0].domain;

            //aggiorno le variabili globali
            old_label=label_selected;
            old_domain=domain_selected;
            id_selected=clickedNodes[0].id;

            //aggiorno dinamicamente la grafica della tabella a fianco
            $("#label_selected").val(label_selected);
            $("#domain_selected").val(domain_selected);
        }
    }
    //creazione dinamica tabelle probabilità
    else if(option_selected === "Probability Table")
    {
        //grafica 
        $("#error_dialog").hide();
        $("#success").hide(); 
        
        id_selected=properties.nodes;
        if(id_selected.length===0)
        	return;
        else
        {
            //ogni volta cancello la tabella e la ricreo
            $("#dynamic_table").remove();
            createDynamicProbabilityTable(id_selected);
        }
    }
    else if(option_selected === "Delete Node")
    {
        //grafica 
        $("#error_dialog").hide();
        $("#success").hide(); 
        
        var ids = properties.nodes;
        nodes.remove(ids);
        var id=(properties.nodes)[0];
        var index = array_keys_nodes.indexOf(id);
        if (index > -1) {
        	array_keys_nodes.splice(index, 1);
        }
        $("#success").show(); 
    }
});

//grafica messaggi di errore 
$("#error_dialog").hide();
$("#success").hide();

//////////////////////////////////////////////////////////////////////////////////////////

Array.prototype.indexOf || (Array.prototype.indexOf = function(d, e) 
{
	var a;
	if (null === this) throw new TypeError('"this" is null or not defined');
	var c = Object(this),
	b = c.length >>> 0;
	if (0 === b) return -1;
	a = +e || 0;
	Infinity === Math.abs(a) && (a = 0);
	if (a >= b) return -1;
	for (a = Math.max(0 <= a ? a : b - Math.abs(a), 0); a < b;) {
		if (a in c && c[a] === d) return a;
		a++;
	}
	return -1;
});

//ogni volta che elimino un nodo cambia di conseguenza
var array_keys_nodes = [];
var array_keys_edges = [];
var count_id_nodes=0;
var count_id_edges=0;
help_flag=0;


$("#button_open_file_hidden").change(function() {
	var file = $(this)[0].files[0];
	$("#fileName").text(file.name);

	if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
		alert('The File APIs are not fully supported in this browser.');
		return;
	}   

	fr = new FileReader();
	fr.onload = receivedText;
	fr.readAsText(file);

	function receivedText() {
		var xmlbif = fr.result;
		var xmlDoc = $.parseXML(xmlbif);
		var $xml = $(xmlDoc);
		loadNetwork($xml);
	}  
});



//voglio aggiungere un nuovo nodo
$("#button_create_node").click(function() {
    //grafica 
    $("#error_dialog").hide();
    $("#success").hide(); 
    $("#name_choice").text("Create Node");
    $("#div_create_arc").hide();
    $("#div_delete_node").hide();
    $("#div_delete_arc").hide();
    $("#div_set_properties").hide();
    $("#div_probability_table").hide();
    $("#div_query").hide();
    $("#help_message").hide();
    $("#div_create_nodes").show();
});

//tipo di creazione scelta
var auto_create = 0;
//in ascii è la lettera A
var alphabet = 96;
var old_label_create ="";

$("#save_create_nodes").click(function() {
    //grafica
    $("#error_dialog").hide();
    $("#success").hide();
    
    //devo controllare che tutti i parametri siano stati inseriti correttamente
    var label = $("#label").val();
    var domain = $("#domain").val();
    
    if(label[0]==='A')
    	auto_create = 1;
    
    if(label==="" || domain==="" || domain.toString().split(',').length<2 || domain.slice(-1)==="," || isExistNode(label)>0)
    	$("#error_dialog").show();
    else 
    {
        //li creo dinamicamente in ordine alfabetico
        if(auto_create===1 && label.length < 2)
        { 
        	count_id_nodes++;
        	alphabet++;
        	$("#error_dialog").hide();
            //aggiungo il nuovo nodo all'Hash "nodes"
            var letter = String.fromCharCode(alphabet).toUpperCase();
            
            if(label !== old_label_create && label[0]!=='A')
            	new_node={ id: count_id_nodes,  label: label, domain: $("#domain").val(),title:"", color:{background:"",border:"black"} };
            else
            	new_node={ id: count_id_nodes,  label: letter, domain: $("#domain").val(),title:"", color:{background:"",border:"black"} };
            
            nodes.add(new_node);
            array_keys_nodes.push(count_id_nodes);
            //aggiorno il nome per velocizzare la creazione
            var tmp = alphabet+1;
            $("#label").val(String.fromCharCode(tmp++).toUpperCase());
            $("#success").show();
            old_label_create = $("#label").val();
            auto_create=1;
        }
        //li creo dinamicamente in ordine alpha-numerico
        else
        {
        	count_id_nodes++;
        	$("#error_dialog").hide();
            //aggiungo il nuovo nodo all'Hash "nodes"
            new_node={ id: count_id_nodes,  label: $("#label").val(), domain: $("#domain").val(),title:"", color:{background:"",border:"black"} };
            nodes.add(new_node);
            array_keys_nodes.push(count_id_nodes);
            //aggiorno il nome per velocizzare la creazione
            $("#label").val("Node "+count_id_nodes);
            $("#success").show();
        }   
    }
});

function loadNetwork(xml){
	array_keys_nodes = [];
	array_keys_edges = [];
	count_id_nodes=0;
	count_id_edges=0;

	nodes.clear();
	edges.clear();

	nodesDict = {};
	probabilitiesDict = {};

	loaded = true;

	centerX = 0;
	centerY = 0;

	var variables = xml.find('VARIABLE');
	variables.each(function(i){
		var variable = new Object();

       	count_id_nodes++;
		variable.id = count_id_nodes;
		variable.name = $(this).find('NAME').text();

		variable.values = [];
		var values = $(this).find('OUTCOME');
		values.each(function(j){
			var value = $(this).text();
			variable.values.push(value);
		});

		var position = $(this).find('PROPERTY').text();
		var position = position.split("(");
		var position = position[1];
		var position = position.split(")");
		var position = position[0];
		var position = position.split(",");

		var x, y;
		if (centerX == 0 && centerY == 0) {
			x = 0;
			y = 0;
			centerX = position[0];
			centerY = position[1];
		} else {
			x = position[0] - centerX;
			y = position[1] - centerY;
		}

		console.log(variable);

		nodes.add({
			id: variable.id,
			label: variable.name,
			x: x,
			y: y,
			domain: variable.values.join(),
			color: {background: "", border: "black"},
		});
        array_keys_nodes.push(variable.id);
        nodesDict[variable.name] = variable;
	});

	var probabilities = xml.find('DEFINITION');
	probabilities.each(function(i){
		var probability = new Object();

		probability.target = nodesDict[$(this).find('FOR').text()];

		probability.given = [];
		$(this).find('GIVEN').each(function(j){
			var given = $(this).text();
			probability.given.push(nodesDict[given]);
		});

		probability.table = $(this).find('TABLE').text().split(" ");

		console.log(probability);

		probabilitiesDict[probability.target.id] = probability;
	});

	$.each(Object.values(probabilitiesDict), function(index, value){
		if (value.given.length != 0) {
			var to = value.target.id;

			var fromVariables = value.given;
			var from = [];
			for (var i = 0; i < fromVariables.length; i++) {
				from.push(fromVariables[i].id);
			}

			for (var i = 0; i < from.length; i++) {
        		count_id_edges++;
				edges.add({
					id: count_id_edges,
					from: from[i].toString(),
					to: to.toString(),
					arrows: 'to'
				});
        		array_keys_edges.push(count_id_edges);
			}
		}
	});
}
//////////////////////////////////////////////////////////////////////////////////////////

//voglio aggiungere un nuovo arco
$("#button_create_arc").click(function() {
    //grafica 
    $("#error_dialog").hide();
    $("#success").hide(); 
    $("#name_choice").text("Create Arc");
    $("#div_create_nodes").hide();
    $("#div_delete_node").hide();
    $("#div_delete_arc").hide();
    $("#div_set_properties").hide();
    $("#div_probability_table").hide();
    $("#div_query").hide();
    $("#help_message").hide();
    $("#div_create_arc").show();
    
    //azzero le variabili globali per la modalità mouse
    id_current=0;
    start=0;
    end=0;
    arc=0;
    flag_arc=0;
    help_flag=0;
});

$("#save_create_arc").click(function() {
    //grafica
    $("#error_dialog").hide();
    $("#success").hide();
    
    console.log(nodes);
    //devo controllare che tutti i parametri siano stati inseriti correttamente
    var from = $("#from").val();
    var to = $("#to").val(); 
    
    //controllo che il nome dei nodi esista davvero nel grafico
    var check_exist_from = isExistNode(from);
    var check_exist_to = isExistNode(to);
    
    if(check_exist_from === 0 || check_exist_to === 0 || isExistArc(getIdFromLabel_nodes(from),getIdFromLabel_nodes(to))>0)
    	$("#error_dialog").show();
    else
    {
    	$("#error_dialog").hide();
    	count_id_edges++;
        //aggiungo il nuovo arco all'hash "edge"
        new_arc={id: count_id_edges,  from:  getIdFromLabel_nodes(from).toString(), to: getIdFromLabel_nodes(to).toString(), arrows: "to" };
        edges.add(new_arc);
        array_keys_edges.push(count_id_edges);
        $("#success").show();
    }
});

//variabili per create/delete arc da mouse
var id_current=0;
var start=0;
var end=0;
var arc=0;
var flag_arc=0;

//drag&drop
network.on("select", function (params) 
{
	var option_selected = $("#name_choice").text(); 

	if(option_selected === "Create Arc")
	{
        //event deselect
        if(params.nodes.length === 0)
        {
            //grafica 
            $("#error_dialog").hide();
            $("#success").hide(); 

            flag_arc=0;
        }
        else
        {
        	if(flag_arc===0)
        	{
                //grafica 
                $("#error_dialog").hide();
                $("#success").hide(); 

                //nodo di inizio
                start = params.nodes.toString();   
                flag_arc = 1;
                id_current = start;
            }
            else
            {
                //destinazione altro nodo
                end = params.nodes.toString();

                if(isExistArc(start,end)>0 || end === start)
                	$("#error_dialog").show();
                else
                {
                	$("#error_dialog").hide();
                    //creo l'arco
                    count_id_edges++;
                    new_arc={id: count_id_edges,  from:  start, to: end, arrows: "to" };
                    edges.add(new_arc);
                    array_keys_edges.push(count_id_edges);
                    $("#success").show();
                    flag_arc=0;
                }  
            }
        }
    }
    //CANCELLA UN ARCO
    else if(option_selected === "Delete Arc")
    {
        //event deselect
        if(params.nodes.length === 0)
        {
            //grafica 
            $("#error_dialog").hide();
            $("#success").hide(); 

            flag_arc=0;
        }
        else
        {
        	if(flag_arc===0)
        	{
                //grafica 
                $("#error_dialog").hide();
                $("#success").hide(); 

                //nodo di inizio
                start = params.nodes.toString();   
                flag_arc = 1;
                id_current = start;
            }
            else
            {
                //destinazione altro nodo
                end = params.nodes.toString();
                var getId = getIdArc_eges(start,end);

                if(getId===0 || end === start)
                	$("#error_dialog").show();
                else
                {
                	$("#error_dialog").hide();
                    //cancello l'arco
                    var id = getId;
                    edges.remove(id);

                    var index = array_keys_edges.indexOf(id);
                    if (index > -1) {
                    	array_keys_edges.splice(index, 1);
                    }
                    $("#success").show(); 
                    flag_arc=0;
                }  
            }
        }
    }
});     

//////////////////////////////////////////////////////////////////////////////////////////

//voglio cancellare un nodo
$("#button_delete_node").click(function() {
    //grafica 
    $("#error_dialog").hide();
    $("#success").hide(); 
    $("#name_choice").text("Delete Node");
    $("#div_create_nodes").hide();
    $("#div_delete_arc").hide();
    $("#div_set_properties").hide();
    $("#div_create_arc").hide();
    $("#div_probability_table").hide();
    $("#div_query").hide();
    $("#help_message").hide();
    $("#div_delete_node").show();
    help_flag=0;
});

$("#save_delete_node").click(function() {
    //grafica 
    $("#error_dialog").hide();
    $("#success").hide();   
    
    //devo controllare che tutti i parametri siano stati inseriti correttamente
    var delete_node = $("#delete_node").val();
    
    //controllo che il nome del nodo esista davvero nel grafico
    var check_node = isExistNode(delete_node);
    
    if(check_node === 0)
    	$("#error_dialog").show();
    else
    {
    	var id = getIdFromLabel_nodes(delete_node);
    	nodes.remove(id);
        //rimuovo l'lemento dall'array di chiavi
        var index = array_keys_nodes.indexOf(id);
        if (index > -1) {
        	array_keys_nodes.splice(index, 1);
        }
        $("#success").show();   
    }
});

//////////////////////////////////////////////////////////////////////////////////////////

//voglio cancellare un arco
$("#button_delete_arc").click(function() {
    //grafica 
    $("#error_dialog").hide();
    $("#success").hide(); 
    $("#name_choice").text("Delete Arc");
    $("#div_create_nodes").hide();
    $("#div_set_properties").hide();
    $("#div_create_arc").hide();
    $("#div_delete_node").hide();
    $("#div_probability_table").hide();
    $("#div_query").hide();
    $("#help_message").hide();
    $("#div_delete_arc").show();
    
    //azzero le variabili globali per la modalità mouse
    id_current=0;
    start=0;
    end=0;
    arc=0;
    flag_arc=0;
    help_flag=0;
});

$("#save_delete_arc").click(function() {
    //grafica 
    $("#error_dialog").hide();
    $("#success").hide();  
    
    //devo controllare che tutti i parametri siano stati inseriti correttamente
    var delete_from = $("#delete_from").val();
    var delete_to = $("#delete_to").val(); 
    
    //controllo che il nome dei nodi esista davvero nel grafico
    var check_exist_from = isExistNode(delete_from);
    var check_exist_to = isExistNode(delete_to);
    var check_exist_arc = isExistArc(getIdFromLabel_nodes(delete_from),getIdFromLabel_nodes(delete_to));
    
    if(check_exist_from === 0 || check_exist_to === 0 || check_exist_arc === 0)
    	$("#error_dialog").show();
    else
    {
        //recupero l'id FROM
        var id_from = getIdFromLabel_nodes(delete_from);
        //recupero l'id TO
        var id_to = getIdFromLabel_nodes(delete_to);
        //recupero l'id totale
        var id = getIdFromLabel_edges(id_from,id_to);
        edges.remove(id);
        
        var index = array_keys_edges.indexOf(id);
        if (index > -1) {
        	array_keys_edges.splice(index, 1);
        }
        $("#success").show(); 
    }
});

//////////////////////////////////////////////////////////////////////////////////////////

//variabili globali per capire se i parametri sono cambiati
//vengono aggiornati nel network.onClick(){..}
var old_label='';
var old_domain='';
var id_selected='';

//voglio modificare le proprietà di un nodo
$("#button_set_properties").click(function() {
    //grafica 
    $("#error_dialog").hide();
    $("#success").hide(); 
    $("#name_choice").text("Set Properties");
    $("#div_create_nodes").hide();
    $("#div_create_arc").hide();
    $("#div_delete_node").hide();
    $("#div_delete_arc").hide();
    $("#div_probability_table").hide();
    $("#div_query").hide();
    $("#help_message").hide();
    $("#div_set_properties").show();
    help_flag=0;
});

$("#save_set_properties").click(function() {

    //controllo che le cose non siano cambiate
    var new_label=$("#label_selected").val();
    var new_domain=$("#domain_selected").val();

    if(old_label==="" || old_domain==="" || new_label==="" || new_domain==="" 
    	|| new_domain.toString().split(',').length<2 
    	|| old_label===new_label && old_domain===new_domain || new_domain.slice(-1)===","){
    	$("#success").hide(); 
    $("#error_dialog").show();
}
else if(new_label !== old_label || new_domain !== old_domain)
{
	nodes.update({ id: id_selected,  label: new_label, domain: new_domain, title:"", color:{background:"",border:"black"} });
	old_domain = new_domain;
	$("#error_dialog").hide();
	$("#success").show(); 
}
});

//////////////////////////////////////////////////////////////////////////////////////////

//variabili globali
var indip=[];

$("#button_probability_table").click(function() {
	$("#success").hide(); 
	$("#error_dialog").hide();
	$("#name_choice").text("Probability Table");
	$("#div_create_nodes").hide();
	$("#div_create_arc").hide();
	$("#div_delete_node").hide();
	$("#div_delete_arc").hide();
	$("#div_set_properties").hide();
	$("#div_query").hide();
	$("#help_message").hide();
	$("#div_probability_table").show();

	indip=[];
	indip.push(getNodesIndip());
	color_nodes_indip();
	help_flag=0;
});

//mi serve per sapere se ho cambiato riga o sono sempre nella stessa
var flag=99;

$("body").on("click", "#check_value", function(event){
    //salgo di livello fino ad arrivare alla tabella 
    var dynamic_flag = $(this).parent().parent().index();

    //CONTROLLO che tutti i valori siano <= 1
    var html = $(this).parent().parent().html();
    //conto quanti input ci sono
    var count_input = (html.match(/input/g) || []).length;

    var total_param=0;
    var val = $(this).parent().parent().children().find('input').each(function(){
    	var param_i = parseFloat(($(this).val()));
    	total_param += param_i;
    });
    
    //controllo
    if(total_param === 1)
    {
    	($(this)).attr("class", "btn btn-success");
    	($(this)).html("✓");
    }
    else
    {
    	($(this)).attr("class", "btn btn-danger");
    	($(this)).html("✗");
    }
});

//////////////////////////////////////////////////////////////////////////////////////////

//voglio risolvere una query
$("#button_query").click(function() {
    //grafica 
    $("#error_dialog").hide();
    $("#success").hide(); 
    $("#name_choice").text("Compute Query");
    $("#div_create_nodes").hide();
    $("#div_delete_node").hide();
    $("#div_delete_arc").hide();
    $("#div_set_properties").hide();
    $("#div_probability_table").hide();
    $("#div_create_arc").hide();
    $("#help_message").hide();
    $("#div_query").show();  
    help_flag=0;
});

//risolvo la query
$("#compute_query").click(function() {
	console.log(network);
});

//////////////////////////////////////////////////////////////////////////////////////////

function isExistNode(string)
{
    //controllo se il nodo esiste nel grafo
    return getIdFromLabel_nodes(string);
}

function isExistArc(from, to)
{
    //controllo se esiste un arco che collega il nodo from al nodo to
    return getIdFromLabel_edges(from,to);
}

function color_nodes_indip()
{
	var values = $.map(nodes, function(v) { return v; });
	for(var v=0; v<values[2]; v++)
	{
		var c = array_keys_nodes[v];
		var dict = (values[1][c]);
		var id_i = dict.id;
		var label_i = dict.label;
		var domain_i = dict.domain;

		if(indip[0].includes(id_i) === true)
		{
			nodes.update({ id: id_i,  label: label_i, domain: domain_i, title:"", color:{background:"orange",border:"black"} });
		}
		else
		{
			nodes.update({ id: id_i,  label: label_i, domain: domain_i, title:"", color:{background:"#97C2FC",border:"black"} });
		}
	}
}

function getNodesIndip()
{
    //numero di nodi presenti
    //risalgo l'id dei nodi indipendenti per la costruzione delle tabelle di probabilità
    var values = $.map(edges, function(v) { return v; });
    //array di nodi dipendenti
    var array_nodes_dip=[];
    var array_nodes_indip=[];
    
    for(var v=0; v<values[2]; v++)
    {
    	var c = array_keys_edges[v];
    	var dict = (values[1][c]);
    	var to_i = dict.to;
    	array_nodes_dip.push(to_i);
    }
    //elimino le doppie
    var uniqueIds_dip = [];
    $.each(array_nodes_dip, function(i, el){
    	if($.inArray(el, uniqueIds_dip) === -1) 
    		uniqueIds_dip.push(el);
    });
    //dall'array delle chiavi elimino i nodi a cui punta un "to"
    array_nodes_indip = array_keys_nodes.slice();
    for(var i=0; i<uniqueIds_dip.length; i++)
    {
    	var elem = parseInt(uniqueIds_dip[i].toString());
    	var index = array_nodes_indip.indexOf(elem);
    	if (index > -1) {
    		array_nodes_indip.splice(index, 1);
    	}
    }
    return array_nodes_indip;
}

function getIdFromLabel_nodes(string)
{
    //dalla label risalgo al suo id
    var values = $.map(nodes, function(v) { return v; });
    //grafo vuoto, nessun nodo
    if(values.length===0)
    	return 0;
    
    for(var v=0; v<values[2]; v++)
    {
    	var c = array_keys_nodes[v];
    	var dict = (values[1][c]);
        //il nodo non esiste nel grafico
        if(dict === undefined)
        	return 0;
        var id_i = dict.id;  
        var label_i = dict.label;
        if(label_i === string){
        	return id_i;
        }
    }
    return 0;
}

function getIdFromLabel_edges(from, to)
{
    //risalgo all'id di edges dai due id from to selezionati
    var values = $.map(edges, function(v) { return v; });
    if(values.length===0)
    	return 0;
    for(var v=0; v<values[2]; v++)
    {
    	var c = array_keys_edges[v];
    	var dict = (values[1][c]);

    	var from_i = dict.from;
    	var to_i = dict.to;
    	var id_i = dict.id;
    	if(from_i === from.toString() && to_i === to.toString()){
    		return id_i;
    	}
    }
    return 0;
}

function getIdArc_eges(from, to)
{
    //dalla label risalgo al suo id
    var values = $.map(edges, function(v) { return v; });
    
    //grafo vuoto, nessun arco
    if(values.length===0)
    	return 0;
    
    for(var v=0; v<values[2]; v++)
    {
    	var c = array_keys_edges[v];
    	var dict = (values[1][c]);
        //il nodo non esiste nel grafico
        if(dict === undefined)
        	return 0;
        var id_i = dict.id;  
        var from_i = dict.from;
        var to_i = dict.to;
        if(from_i === from && to_i === to){
        	return id_i;
        }
    }
    return 0;
}

function createDynamicProbabilityTable(node_id_selected)
{
    //mi serve sapere quanti domini possiede il nodo selezionato
    var len_domain_node_selected = getDomainFromId(node_id_selected).toString().split(',').length;
    //adesso invece mi servono i nodi collegati
    var allDomain = getAllDomainConnectedToId(node_id_selected);
    //righe e colonne dinamiche per creare la tabella
    var row_table = 1;
    var column_table = len_domain_node_selected + allDomain.length;
    
    //è indipendente
    if(allDomain.length !== 0)
    {
        //devo sapere quanti elementi ci sono nei vari domini (ovvero quanti sono i domini)
        for(var i=0; i<allDomain.length; i++)
        {
        	var elem_i = allDomain[i].toString().split(',').length;
        	row_table *= elem_i;
        }
    }

    //console.log('row->',row_table);
    //console.log('column->',column_table);
    
    var nodes_connected = findNodesConnected_To(node_id_selected);

    console.log(nodes_connected);
    
    //CREAZIONE DINAMICA DELLA TABELLA
    
    var table = $("<table id='dynamic_table' class='table table-hover mt-3'>");

    $("#div_probability_table").append(table);

    ///
    /// Table head (column)
    ///
    
    var row_table_head=row_table;
    var column_table_head=column_table;
    
    //parte dinamica
    html = "<thead id='thead'><tr class='table-primary text-center'>";
    
    var el = parseInt(node_id_selected[0].toString());
    var my_domain = getDomainFromId(node_id_selected).toString().split(',');
    
    //E' INDIPENDENTE
    if(indip[0].includes(el) === true)
    {
        //solo i suoi domini
        for(var j=0; j<my_domain.length; j++)
        {
        	var str = getLabelFromId(id_selected) + " ("+my_domain[j]+")";
        	html = html + "<th><strong>" + str + "</strong></th>";
        }
        html = html + "<th><strong></strong></th>";
    }
    else
    {
        //NON E' INDIPENDENTE
        var only_to = findNodesConnected_From(node_id_selected);          
        var array_column = [];
        
        if(only_to.length === 0)
        {
            //ha solo archi entranti
            for(var j=0; j<nodes_connected.length; j++)
            {
            	array_column.push(nodes_connected[j]);
            	var str = getLabelFromId(nodes_connected[j]);
            	html = html + "<th><strong>" + str + "</strong></th>";
            	flag=1;
            }
            //i miei domini
            for(var j=0; j<my_domain.length; j++)
            {
            	array_column.push(node_id_selected[0].toString());
            	var str = getLabelFromId(node_id_selected) + " ("+my_domain[j]+")";;
            	html = html + "<th><strong>" + str + "</strong></th>";
            	flag=1;
            }
            html = html + "<th><strong></strong></th>";
        }
        else
        {
            //ha sia archi entranti che uscenti
            var flag = 0;
            var index = 0;
            for (var columnCount = 0; columnCount <= column_table_head; columnCount++) 
            {
            	if(flag === 0)
            	{
            		for(var j=0; j<nodes_connected.length; j++)
            		{
            			array_column.push(nodes_connected[j]);
            			column_table_head--;
            			var str = getLabelFromId(nodes_connected[j]);
            			html = html + "<th><strong>" + str + "</strong></th>";
            			flag=1;
            		}
            	}
            	else
            	{
            		array_column.push(node_id_selected[0].toString());
            		var str = getLabelFromId(node_id_selected) + " ("+my_domain.toString().split(',')[index]+")";;
            		html = html + "<th><strong>" + str + "</strong></th>";
            		index++;
            	}
            }
            html = html + "<th><strong></strong></th>";
        }
    }

    html = html + "</tr></thead>";
    table.append($(html));

    ///
    /// Table body (row)
    ///

    // TODO: risolvere bug splitting dominio

    var row_table_body=row_table;
    var column_table_body=column_table;

    //tutte le combinazioni dei domini presi a k gruppi
    var array_domain=[];
    //ho un solo nodo, quindi un solo dominio!
    if(allDomain.length === 1 || allDomain.length === 0)
    	var num_of_nodes = 1;    
    else
    	var num_of_nodes = allDomain.toString().split(',').length;

    var count_nodes = num_of_nodes;
    
    //mi salva tutti i domini a prescindere da indip che dip
    var combinations_domain = [];
    
    if(count_nodes === 1)
    {
        //nodo indip
        if(indip[0].includes(node_id_selected[0]) === true)
        {
            //nodo indip
            var domain_selected = getDomainFromId(node_id_selected).toString().split(',');

            for(var j=0; j<domain_selected.length; j++)
            {
            	combinations_domain.push(domain_selected[j]);
            }
        }
        else
        {
            //nodo che entra e che esce (misto)
            var node_from = nodes_connected[0].toString();
            var domain_selected = getDomainFromId(node_from).toString().split(',');
            combinations_domain = domain_selected;
        }
    }
    else
    {
    	for(var i=0; i< count_nodes; i++)
    	{
    		var elem = allDomain[i];
    		var count = elem.toString().split(',').length;
    		var single_domain = elem.toString().split(',');
    		for(var j=0; j< count; j++)
    		{
    			array_domain.push(single_domain[j]);
    		}
    		count_nodes -= count;
    		i=0;
    	}

    	var k_group = allDomain.length;
    	var combs = combinations(array_domain,k_group);

        //elimino le doppie
        var hashMap = {};

        combs.forEach(function(arr){
        	hashMap[arr.join("|")] = arr;
        });

        combinations_domain = Object.keys(hashMap).map(function(k){
        	return hashMap[k];
        });
    }
    
    console.log(combinations_domain);
    
    //se sono indipendenti, ho una sola riga!
    if(row_table_body === 1)
    {
    	html = "<tr class='table-dark text-center'>";
    	for (var fieldCount = 0; fieldCount < column_table_body; fieldCount++) {
    		if(fieldCount > 1)
    			var str = "<input style='text-align: center' value=0.0>";
    		else
    			var str = "<input style='text-align: center' value=0.5>";
    		html = html + "<td>" + str + "</td>";
    	}
    	html = html +"<td><button id='check_value' type='button' class='btn btn-success'>✓</button></td></tr>"; 
    	table.append($(html));
    }
    else
    {
    	for (var rowCount = 0; rowCount < row_table_body; rowCount++) 
    	{
    		html = "<tr class='table-dark text-center'>";

    		for (var fieldCount = 0; fieldCount < column_table_body; fieldCount++) {
    			if(array_column[fieldCount].toString() === node_id_selected.toString())
    			{
    				var str = "<input style='text-align: center' value=0.5>";
    				html = html + "<td>" + str + "</td>";
    			}
    			else
    			{
    				var str = combinations_domain[rowCount][fieldCount];
    				html = html + "<td>" + str + "</td>";
    			}    
    		}
    		html = html +"<td><button id='check_value' type='button' class='btn btn-success'>✓</button></td></tr>";
    		table.append($(html));
    	}
    }
}

function combinations(arr, size) 
{
	var len = arr.length;

	if (size > len) return [];
	if (!size) return [[]];
	if (size === len) return [arr];

	return arr.reduce(function (acc, val, i) {
		var res = combinations(arr.slice(i + 1), size - 1)
		.map(function (comb) { return [val].concat(comb); });

		return acc.concat(res);
	}, []);
}


function getAllDomainConnectedToId(node_id_selected)
{
    //prima mi servono gli id dei vari nodi
    var nodes_connected = findNodesConnected_To(node_id_selected);
    
    if(nodes_connected.length === 0)
    {
        //vuol dire che non ci sono archi entranti al nodo
        return [];
    }
    else
    {
        //adesso per ogni id vado a salvarmi i loro domini
        var allDomain = [];
        for (var i=0; i<nodes_connected.length; i++)
        {
        	var domain_i = getDomainFromId(nodes_connected[i]);
        	allDomain.push(domain_i);
        }
        return allDomain;
    }
}

function findNodesConnected_From(node_id_selected)
{
	var nodes_connected = [];
    //scorro tutto l'array edge e salvo gli id che hanno "to" == node_id_selected
    var values = $.map(edges, function(v) { return v; });
    for(var v=0; v<values[2]; v++)
    {
    	var c = array_keys_edges[v];
    	var dict = (values[1][c]);
    	var from_i = dict.from;
    	var to_i = dict.to;
    	if(from_i === node_id_selected[0].toString()){
    		nodes_connected.push(to_i);
    	}
    }
    return nodes_connected;
}

function findNodesConnected_To(node_id_selected)
{
	var nodes_connected = [];
    //scorro tutto l'array edge e salvo gli id che hanno "to" == node_id_selected
    var values = $.map(edges, function(v) { return v; });
    for(var v=0; v<values[2]; v++)
    {
    	var c = array_keys_edges[v];
    	var dict = (values[1][c]);
    	var to_i = dict.to;
    	var from_i = dict.from;
    	var elem = node_id_selected[0].toString();
    	if(to_i === elem){
    		nodes_connected.push(from_i);
    	}
    }
    return nodes_connected;
}

function getDomainFromId(id_node)
{
    //scorro tutto l'array "nodes" e ne salvo i domini
    var values = $.map(nodes, function(v) { return v; });
    for(var v=0; v<values[2]; v++)
    {
    	var c = array_keys_nodes[v];
    	var dict = (values[1][c]);
    	var id_i = dict.id;
    	var domain_i = dict.domain;
    	if(id_i === parseInt(id_node)){
    		return domain_i;
    	}
    }
}

function getLabelFromId(id_node)
{
    //scorro tutto l'array "nodes" e ne salvo i label
    var values = $.map(nodes, function(v) { return v; });
    for(var v=0; v<values[2]; v++)
    {
    	var c = array_keys_nodes[v];
    	var dict = (values[1][c]);
    	var id_i = dict.id;
    	var label_i = dict.label;
    	if(id_i === parseInt(id_node)){
    		return label_i;
    	}
    }
}

//mi serve per mostrare l'help
var help_flag=0;

$("#help").click(function() 
{
    //per ogni voce del menu ho un help diverso ovviamente
    var option_selected = $("#name_choice").text();
    if(help_flag===0 && option_selected === "Create Node")
    {
    	$("#help_message").html("1) assign <strong>Name</strong> to the node </br> 2) assign <strong>Domain</strong> to the node </br> 3) click <strong>Create!</strong></br></br><strong>TIPS</strong> if name starts with 'A' 🡲 create alphabetical order </br>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;else 🡲 create numerical order");
    	$("#help_message").show();
    	help_flag=1;
    }
    else if(help_flag===0 && option_selected === "Create Arc")
    {
    	$("#help_message").html("1) click it the <strong>first node</strong> (from) </br> 2) click it the <strong>second node</strong> (to) </br></br> (click outside for deselect your chioce)");
    	$("#help_message").show();
    	help_flag=1;
    }
    else if(help_flag===0 && option_selected === "Delete Node")
    {
    	$("#help_message").html("Click into the <strong>node to be destroyed</strong>");
    	$("#help_message").show();
    	help_flag=1;
    }
    else if(help_flag===0 && option_selected === "Delete Arc")
    {
    	$("#help_message").html("1) click it the <strong>first node</strong> (from) </br> 2) click it the <strong>second node</strong> (to) </br></br> (click outside for deselect your chioce)");
    	$("#help_message").show();
    	help_flag=1;
    }
    else if(help_flag===0 && option_selected === "Set Properties")
    {
    	$("#help_message").html("1) select <strong>node to modify </strong></br> 2) change his value: <strong>name</strong> or <strong>domain</strong></br> 3) click to Change!");
    	$("#help_message").show();
    	help_flag=1;
    }
    else if(help_flag===0 && option_selected === "Probability Table")
    {
    	$("#help_message").html("1) Click into the <strong>node</strong></br> 2) <strong>compile</strong> his probability table</br> 3) <strong>check</strong> the insert value and <strong>save</strong> the row");
    	$("#help_message").show();
    	help_flag=1;
    }
    else
    {
    	$("#help_message").hide();
    	help_flag=0;
    }
});
