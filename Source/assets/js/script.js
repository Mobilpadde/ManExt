// Speed up calls to hasOwnProperty
// http://stackoverflow.com/a/4994244/754471
var hasOwnProperty = Object.prototype.hasOwnProperty;
function isEmpty(obj) {

    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length && obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and toValue enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}

refreshGroups = function(){
	$("#groups ul").html("");
	$("#form").hide();
	$("#info").hide();
	chrome.storage.local.get("groups", function(data){
		for(var i = 0; i < data.groups.length; i++){
			$("<li>"+data.groups[i]+"</li>").addClass("info").appendTo("#groups ul");
		}
		
		$("#groups li").click(function(){
			_this = this;
			if($("#extensions .selected").length > 0){
				if($(_this).hasClass("selected")){
						chrome.storage.local.get($(_this).text(), function(data){
							for(var i = 0; i < $("#extensions .selected").length; i++){
								delete data[$(_this).text()][$($("#extensions .selected")[i]).attr("data-id")];
							}
							
							chrome.storage.local.set(data, function(){
								$("#extensions .selected").removeClass("selected");
								$(_this).click();
							});
						})
				}else{
						chrome.storage.local.get($(_this).text(), function(data){
							if(isEmpty(data) || isEmpty(data[$(_this).text()])){
								data = new Object(); 
								data[$(_this).text()] = new Object();
							}
							for(var i = 0; i < $("#extensions .selected").length; i++){
								data[$(_this).text()][$($("#extensions .selected")[i]).attr("data-id")] = $($("#extensions .selected")[i]).text();
							}

							chrome.storage.local.set(data, function(){
								$("#extensions .selected").removeClass("selected");
								$(_this).click();
							});
						})
				}
			}else{
				if($("#groups .selected").length == 1){
					if($(this).hasClass("selected")){
						$(this).removeClass("selected");
						refreshExts();
						$("#new").show();
						$("#delete").hide();
					}else{
						$("#groups .selected").removeClass("selected");
						$(this).addClass("selected");
						refreshExts($(this).text());
					}
				}else{
					$(this).addClass("selected");
					refreshExts($(this).text());
					$("#new").hide();
					$("#delete").show();
				}
			}
		})
	})
}
refreshExts = function(name){
	$("#extensions").html("");
	if(name){
		chrome.storage.local.get(name, function(data){
			console.log(data)
			for(var i in data[name]){
				if(i != name){
					var ext = $("<li>"+data[name][i]+"</li>").addClass("unselected").attr("data-id", i).appendTo("#extensions");
					if(!exts[i].enabled){
						ext.addClass("disabled");
					}
				}
			}
			$("#extensions li").click(function(){
				if($(this).hasClass("selected")){
					$(this).removeClass("selected").addClass("unselected");
				}else{
					$(this).removeClass("unselected").addClass("selected");
				}
				if($("#extensions .selected").length > 0){
					$("#info").show();
				}else{
					$("#info").hide();
				}
			})
		})
	}else{
		for(var e in exts){
			var ext = $("<li>"+exts[e].name+"</li>").addClass("unselected").attr("data-id", e).appendTo("#extensions");
			if(!exts[e].enabled){
				ext.addClass("disabled");
			}
		}
		$("#extensions li").click(function(){
			if($(this).hasClass("selected")){
				$(this).removeClass("selected").addClass("unselected");
			}else{
				$(this).removeClass("unselected").addClass("selected");
			}
			if($("#extensions .selected").length > 0){
				$("#info").show();
			}else{
				$("#info").hide();
			}
		})
	}
}
var exts = new Object();
$(document).ready(function(){
	/*
	exts["01"] = "Ext.01"; exts["02"] = "Ext.02";
	exts["03"] = "Ext.03"; exts["04"] = "Ext.04";
	exts["05"] = "Ext.05"; exts["06"] = "Ext.06";
	exts["07"] = "Ext.07"; exts["08"] = "Ext.08";
	exts["09"] = "Ext.09"; exts["10"] = "Ext.10";
	*/

	var tmpObj = new Object(), 
		tmpArr = new Array();

	chrome.management.getAll(function(data){
		data.forEach(function(e, i){
			if(e.type == "extension"){
				//exts[e.id] = e;
				tmpObj[e.name] = e;
				tmpArr.push(e.name);
			}
		})
		tmpArr.sort();
		tmpArr.forEach(function(e, i){
			exts[tmpObj[e].id] = tmpObj[e];
		})
		console.log(exts);
	

		chrome.storage.local.get("groups", function(data){
			if(isEmpty(data.groups)){
				chrome.storage.local.set({"groups":["Stuff"]});
			}
			
			refreshGroups();
			refreshExts();
			//$("#enable").hide();
			$("#form").hide();
			$("#delete").hide();
			$("#info").hide();

			// Quite a long work-around, to make it not duplicate groups D:
			var lastInput = 0;
			$("#new").click(function(){
				$("#form").show().keyup(function(e){
					if(e.keyCode == 13 && $("#nameNew").val() != "" && !/^\s+$/.test($("#nameNew").val())){
						var d = new Date().getTime();
						chrome.storage.local.get("groups", function(data){
							data.groups.push($("#nameNew").val());
							if(data[data.groups.length - 1] != "" && lastInput != $("#nameNew").val()){
								//console.log((lastInput != $("#nameNew").val()), lastInput, $("#nameNew").val());
								lastInput = $("#nameNew").val();
								chrome.storage.local.set({"groups": data.groups}, function(){
									refreshGroups();
									$("#form").hide();
									$("#nameNew").val("");
									console.log(data.groups, new Date(new Date().getTime() - d).getTime() + "ms");
								});
							}
						})
					}
				})
			})

			$("#delete").click(function(){
				chrome.storage.local.get("groups", function(data){
					for(var i = 0; i < data.groups.length; i++){
						if($($("#groups .selected")[0]).text() == data.groups[i]){
							$("#groups .selected").click();
							data.groups.splice(i, 1);
							chrome.storage.local.set({"groups": data.groups});
							refreshGroups();
							refreshExts();
						}
					}
				})
			})

			$("#enable").click(function(){
				var i = 0;
				enable = function(i){
					var e = $($("#extensions .selected")[i]);
					chrome.management.setEnabled(e.attr("data-id"), true, function(){
						e.removeClass("disabled");
						i++;
						if(i < $("#extensions .selected").length){
							enable(i);
						}
					})
				}
				enable(i);
			})

			$("#disable").click(function(){
				var i = 0;
				disable = function(i){
					var e = $($("#extensions .selected")[i]);
					chrome.management.setEnabled(e.attr("data-id"), false, function(){
						e.addClass("disabled");
						i++;
						if(i < $("#extensions .selected").length){
							disable(i);
						}
					})
				}
				disable(i);
			})

			$("#info").click(function(){
				var i = 0;
				openTab = function(i){
					var e = $($("#extensions .selected")[i]);
					chrome.tabs.create({"url": exts[e.attr("data-id")].homepageUrl}, function(){
						i++;
						if(i < $("#extensions .selected").length){
							openTab(i);
						}
					})
				}
				openTab(i);
			})

			$("#uninstall").click(function(){
				var i = 0;
				uninstall = function(i){
					var e = $($("#extensions .selected")[i]);
					chrome.management.uninstall(e.attr("data-id"), {"showConfirmDialog": true}, function(){
						i++;
						console.log(e.attr("data-id"));
						if(i < $("#extensions .selected").length){
							uninstall(i);
						}
					})
				}
				uninstall(i);
			})

		})
	})
})