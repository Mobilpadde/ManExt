var refreshAll = function(){
		$("#groups").html("")
		chrome.storage.local.get("groups", function(data){
			if(data.groups){
				// http://javascript.about.com/library/blsort1.htm
				data.groups.sort(function(a, b){a = a.toLowerCase(); b = b.toLowerCase(); if (a<b) return 1; if (a>b) return -1; return 0;})
				for(var i in data.groups){
					$("<li class='group shown " + 
					data.groups[i] + 
					"'><span class='groupName'><i class='fa fa-chevron-down'></i> " + 
					data.groups[i] + 
					"</span><ul class='extensions'></ul></li>").prependTo("#groups")
				}

				$("<li class='group shown uncategorized'><span class='groupName'>\
					<i class='fa fa-chevron-down'></i> Uncategorized</span><ul class='extensions'></ul></li>").appendTo("#groups")

				var ids = []
				for(e in exts){
					ids.push(e)
				}

				chrome.storage.local.get(ids, function(data){
					for(e in exts){
						var playPause
						if(exts[e].enabled){
							playPause = "pause"
						}else{ playPause = "play" }

						if(data[e]){
							var ext = $("<li><i class='fa fa-" + playPause + "'></i> \
								<i class='fa fa-info-circle' data-url='" + exts[e].homepageUrl + "'></i> \
								<i class='fa fa-cog' data-url='" + exts[e].optionsUrl + "'></i> &mdash; \
								" + exts[e].name + "</li>").addClass("extension").attr("data-id", exts[e].id).appendTo(".group." + data[e] + " .extensions")
						}else{
							var ext = $("<li><i class='fa fa-" + playPause + "'></i> \
								<i class='fa fa-info-circle' data-url='" + exts[e].homepageUrl + "'></i> \
								<i class='fa fa-cog' data-url='" + exts[e].optionsUrl + "'></i> &mdash; \
								" + exts[e].name + "</li>").addClass("extension").attr("data-id", exts[e].id).appendTo(".group.uncategorized .extensions")
						}
						
						if(!exts[e].enabled){
							ext.css("text-decoration", "line-through")
						}
					}
				})
			}else{
				$("<li class='group shown uncategorized'><span class='groupName'>\
					<i class='fa fa-chevron-down'></i> Uncategorized</span><ul class='extensions'></ul></li>").appendTo("#groups")

				var ids = []
				for(e in exts){
					ids.push(e)
				}

				chrome.storage.local.get(ids, function(data){
					for(e in exts){
						var playPause
						if(exts[e].enabled){
							playPause = "pause"
						}else{ playPause = "play" }

						if(data[e]){
							var ext = $("<li><i class='fa fa-" + playPause + "'></i> \
								<i class='fa fa-info-circle' data-url='" + exts[e].homepageUrl + "'></i> \
								<i class='fa fa-cog' data-url='" + exts[e].optionsUrl + "'></i> &mdash; \
								" + exts[e].name + "</li>").addClass("extension").attr("data-id", exts[e].id).appendTo(".group." + data[e] + " .extensions")
						}else{
							var ext = $("<li><i class='fa fa-" + playPause + "'></i> \
								<i class='fa fa-info-circle' data-url='" + exts[e].homepageUrl + "'></i> \
								<i class='fa fa-cog' data-url='" + exts[e].optionsUrl + "'></i> &mdash; \
								" + exts[e].name + "</li>").addClass("extension").attr("data-id", exts[e].id).appendTo(".group.uncategorized .extensions")
						}
						
						if(!exts[e].enabled){
							ext.css("text-decoration", "line-through")
						}
					}
				})
			}
		})
	}, 
	exts = {}

$(document).ready(function(){
	var tmpObj = {},
		tmpArr = []
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

		refreshAll()

		$(document).on("click", "#menu #select", function(){
			var _this = this
			if($("#menu #selectExtra").is(":hidden")){
				$(_this).addClass("shown")
				$("#menu #manage").removeClass("shown")
				$("#menu #selectExtra").show()
				$("#menu #manageExtra").hide()
				$("body").css("margin-top", "52px")
			}else{
				$(_this).removeClass("shown")
				$("#menu #selectExtra").hide()
				$("body").css("margin-top", "26px")
			}
		})

		$(document).on("click", "#menu #manage", function(){
			var _this = this
			if($("#menu #manageExtra").is(":hidden")){
				$(_this).addClass("shown")
				$("#menu #select").removeClass("shown")
				$("#menu #manageExtra").show()
				$("#menu #selectExtra").hide()
				$("body").css("margin-top", "52px")
			}else{
				$(_this).removeClass("shown")
				$("#menu #manageExtra").hide()
				$("body").css("margin-top", "26px")
			}
		})

		$(document).on("click", "#menu #refresh", function(){
			refreshAll()
		})

		$(document).on("click", "#menu #webstore", function(){
			chrome.tabs.create({"url": "https://chrome.google.com/webstore/category/extensions"})
		})

		$(document).on("click", "#moveTo", function(){
			$("#selectGroup").html("")
			chrome.storage.local.get("groups", function(data){
				for(var i in data.groups){
					$("<option>" + data.groups[i] + "</option>").appendTo("#selectGroup")
				}
				$("#overlay, #popup, #popup #moveExtensions").show()
			})
		})

		$(document).on("click", "#selectButton", function(){
			var ids = []
			$(".selected").each(function(i, e){
				ids.push($(e).attr("data-id"))
			})

			for(var i in ids){
				var data = {}
					data[ids[i]] = $("#selectGroup").val()
				chrome.storage.local.set(data)
			}
			setTimeout(function(){
				$("#overlay").click()
				refreshAll()
			}, 50)
		})

		$(document).on("click", "#uninstall", function(){
			$("#uninstallSelect").html("")
			$(".selected").each(function(i, e){
				$("<option>" + exts[$(e).attr("data-id")].name + "</option>").appendTo("#uninstallSelect")
			})
			$("#overlay, #popup, #popup #uninstallExtensions").show()
		})

		$(document).on("click", "#uninstallButton", function(){
			var i = 0;
			uninstall = function(i){
				var e = $($(".selected")[i]);
				chrome.management.uninstall($(e).attr("data-id"), {"showConfirmDialog": true}, function(){
					i++;
					console.log($(e).attr("data-id"));
					if(i < $(".selected").length){
						uninstall(i);
					}else{
						$("#overlay").click()
						refreshAll()
					}
				})
			}
			uninstall(i);

			/*setTimeout(function(){
				$("#overlay").click()
				refreshAll()
			}, 50)*/
		})

		$(document).on("click", "#createGroup", function(){
			$("#overlay, #popup, #popup #newGroup").show()
		})

		$(document).on("click", "#groupNamerButton", function(){
			chrome.storage.local.get("groups", function(data){
				if(data.groups == undefined){
					data["groups"] = []
				}
				for(var i in data.groups){
					if(data.groups[i] == $("#groupNamerText").val()){
						return false
					}
				}
				data.groups.push($("#groupNamerText").val())

				chrome.storage.local.set({"groups": data.groups}, function(e){
					$("#groupNamerText").val("")
					$("#overlay").click()
					refreshAll()
				})
			})
		})

		$(document).on("click", "#removeGroup", function(){
			$("#selectGroupDelete").html("")
			chrome.storage.local.get("groups", function(data){
				for(var i in data.groups){
					$("<option>" + data.groups[i] + "</option>").appendTo("#selectGroupDelete")
				}
				$("#overlay, #popup, #popup #deleteGroup").show()
			})
		})

		$(document).on("click", "#selectDeleteButton", function(){
			var ids = []
			$("." + $("#selectGroupDelete").val() + " .extension").each(function(i, e){
				ids.push($($("." + $("#selectGroupDelete").val() + " .extension")[i]).attr("data-id"))
			})
			chrome.storage.local.remove(ids, function(){
				chrome.storage.local.get("groups", function(data){
					data.groups.splice(data.groups.indexOf($("#selectGroupDelete").val()), 1)

					chrome.storage.local.set({"groups": data.groups}, function(e){
						$("#overlay").click()
						refreshAll()
					})
				})
			})
		})

		$(document).on("click", "#overlay", function(){
			$("#overlay, #popup, #popup #moveExtensions, #popup #newGroup, #popup #deleteGroup, #popup #uninstallExtensions").hide()
		})

		$(document).on("click", "#groups .group .groupName", function(){
			if($(this).parent().hasClass("shown")){
				$(this).parent().removeClass("shown")
				$(this).children(".fa-chevron-down").removeClass("fa-chevron-down").addClass("fa-chevron-right")
			}else{
				$(this).parent().addClass("shown")
				$(this).children(".fa-chevron-right").removeClass("fa-chevron-right").addClass("fa-chevron-down")
			}
		})

		$(document).on("click", ".extension", function(){
			if($("#menu #select").hasClass("shown")){
				if($(this).hasClass("selected")){
					$(this).removeClass("selected")
				}else{
					$(this).addClass("selected")
				}
			}
		})

		$(document).on("click", ".fa-info-circle", function(){
			chrome.tabs.create({"url": $(this).attr("data-url")})
		})

		$(document).on("click", ".fa-cog", function(){
			chrome.tabs.create({"url": $(this).attr("data-url")})
		})

		$(document).on("click", ".fa-pause", function(){
			var _this = this
			chrome.management.setEnabled($(_this).parent().attr("data-id"), false, function(){
				$(_this).parent().css("text-decoration", "line-through")
				$(_this).removeClass("fa-pause").addClass("fa-play")
			})
		})

		$(document).on("click", ".fa-play", function(){
			var _this = this
			chrome.management.setEnabled($(_this).parent().attr("data-id"), true, function(){
				$(_this).parent().css("text-decoration", "none")
				$(_this).removeClass("fa-play").addClass("fa-pause")
			})
		})
	})
})