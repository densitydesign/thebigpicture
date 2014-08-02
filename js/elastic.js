function elastic(fullCont,vizCont, imgFolder, imgFile) {

    var col = true,
        rows,
        siz = 12,
        ndata,
        load = 0,
        count = 0,
        currArray,
        paginate,
        scrollEnd = false,
        langScale,
        tagScale,
        allLangs = [],
        tagsArr = [],
        langsArr = [],
        //fullCont = ".im-italy",
        //vizCont = "#ita-elastic",
        cont = vizCont + " .viz_googleimages",
        sliderContainer,
        radContainer,
        imgsContainer,
        imgs,
        sortby = "brightness_median",
        col = false,
        loaded = false,
        loading = false,
        rows,
        allLangSel=false;
        allTagSel=false;


//console.log(vizContainer)

    var filters = [
        [ "hue" , "hue_median"],
        ["saturation" , "saturation_median"],
        ["brightness" , "brightness_median"],
        ["rank" , "rank"]
    ]

    var im = [];

    d3.tsv(imgFile, function (data) {
        rows = data;
        imgarr = $.map(rows, function (val, i) {
            return imgFolder + val.image;
        })


        preloadImages(imgarr, im, init)

        //init();
        checkOpacity = setInterval(callImage, 500);
    })


    var init;
    init = function () {

        $(fullCont + ".progress-cont").fadeOut(500, function () {
            $(fullCont + '.googleimages').css("opacity", 1)
        });

        ndata = d3.nest()
            .key(function (d) {
                return d.lang;
            })
            .key(function (d) {
                return d.keyword;
            })
            .entries(rows);

        ndata.forEach(function (d, i) {
            allLangs.push(d.key);
            d.count = 0;
            d['values'].forEach(function(e,j){
                d.count+=e['values'].length
            })
        })


        ndata.sort(function(a,b){
            return b.count-a.count;
        })

        var maxH = 0


        ndata.forEach(function (d, i) {
            d.y = maxH
            d['values'].forEach(function (e, j) {
                maxH += e['values'].length
            });
        });



       
        var margin = {top: 2, right: 10, bottom: 5, left: 10},
            width = ($(cont).width()) * 0.75,
            totwidth = ($(cont).width()) * 0.8
        height = 25

        var listW = 30;

        d3.select(cont).append("div")
            .attr("class", "slider")

        sliderContainer = $(fullCont + " .slider")

        console.log(sliderContainer)


        d3.select(cont).append("div")
            .attr("class", "rad")
            .attr("style", "float:left; clear:right")

        radContainer = $(fullCont + " .rad")


        var control = d3.select(cont).append("div")
            .attr("class", "controllers")

        control.append("div")
            .attr("class", "list-labels")
            .append("h3")
            .text("source ")
            .append("span")
            .attr("class", "rem-langs glyphicon glyphicon-remove")
            .style("color", "#02484C")
            .style("font-size", "0.5em")

        var svg, langs, tags;
        svg = control.append("svg")
            .attr("width", (totwidth + margin.left + margin.right))
            .attr("height", (height + margin.top + margin.bottom))
            .attr("style", "float:left")


        control.append("div")
            .attr("class", "list-labels")
            .append("h3")
            .text("categories ")
            .append("span")
            .attr("class", "rem-tags glyphicon glyphicon-remove")
            .style("color", "#02484C")
            .style("font-size", "0.5em")

        svgTags = control.append("svg")
            .attr("width", (totwidth + margin.left + margin.right))
            .attr("height", (height + margin.top + margin.bottom))
            .attr("style", "float:left")

        var filtdiv = d3.select(cont).append("div")
            .attr("class", "img-filters list-labels")

        filtdiv.append("h3")
            .text("sort by")

        filters.forEach(function (e, i) {
            filtdiv.append("div")
                .append("span")
                .text(e[0])
                .attr("data-value", e[1])
                .attr("class", function () {
                    if (e[1] === sortby) return "sort sort-active"
                    else return "sort";
                })

        })

        $(sliderContainer).slider({'min': 12, 'max': 80, 'value': 12})
            .on('slide', function (ev) {
                changeSize(ev.value)
            });

        $(radContainer).append('<div class="btn-group show-lvl"><button id="language" type="button" class="btn btn-default btn-sm elstc-img active">Images</button><button id="forum" type="button" class="btn btn-default btn-sm elstc-clr">Colors</button></div>')


        d3.select(vizCont).append("div")
            .attr("class", "imgs")
            .attr("id", "google-imgs-grid");

        imgsContainer = $(vizCont + " .imgs")

        var offset = $(imgsContainer).position().top
        $(imgsContainer).height(400);

        paginate = $(imgsContainer).width() * $(imgsContainer).height() / (siz * siz) + $(imgsContainer).width() / siz;
        console.log("paginate", paginate)


        //var t = d3.select("svg").append("g").attr("class","tag-group")
        var t = svgTags.append("g").attr("class", "tag-group")

        function viz_googleimages() {


           tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d.key; });
           svg.call(tip)


            //scale function
            langScale = d3.scale.linear().domain([0, maxH]);
            langScale.range([0, width])

            //draw lang rects
            langs = svg.selectAll(".lang").data(ndata)
                .enter()
                .append("rect")
                .attr("class", function (d) {
                    return "lang " + d.key.replace(/\s/g, '_');
                })
                .attr("y", 0)
                .attr("x", function (d) {
                    return langScale(d.y) + 2
                })
                .attr("height", listW)
                .attr("width", function (d) {
                    return langScale(d.count)
                })
                .style("fill", function (d) {
                    return "#F0F0F0";
                })
                .style("stroke", "#fff")
                .on("click", function (d) {
                    // console.log(d)
                    if (!d3.select(this).classed("sel")) {
                        d.sel = true;
                        d3.select(this).classed("sel", true);
                        var index = langsArr.indexOf(d.key);
                        if (index == -1) {
                            langsArr.push(d.key);
                        }
                        //ealstify list
                        elastify();
                        loadImages();
                    }
                    else {

                        if(allLangSel) {
                            d3.selectAll(fullCont+" .lang").classed("sel",false)
                            allLangSel=false;
                             d3.select(this).classed("sel", true);
                            langsArr.push(d.key);
                        }

                        else {
                            d.sel = false;
                            d3.select(this).classed("sel", false)
                            var index = langsArr.indexOf(d.key);
                            if (index > -1) {
                                langsArr.splice(index, 1);
                            }
                            if (!langsArr.length) {
                             
                                checkAllSel();

                            }
                        }
                        //	else{
                        elastify();
                        loadImages();
                        //	}
                    }

                })
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)

            //labels for languages
            svg.selectAll(".lang-txt")
                .data(ndata)
                .enter()
                .append("text")
                .attr("class", "lang-txt")
                .attr("font-family", "serif")
                .attr("font-size", "1em")
                .attr("y", 0)
                .attr("x", function (d) {
                    return langScale(d.y) + 2
                })
                .attr("dx", "0.4em")
                .attr("dy", "1.3em")
                .style("fill", "#222222")
                .text(function (d) {
                    return d.key
                })

            loadWhole();

        }


        function loadWhole() {

            langsArr = allLangs;
            elastify();
            loadImages();
            langsArr = [];

        }

        function elastify() {
            var dt;
            if (!langsArr.length)  dt = rows.filter(function (e) {
                return allLangs.indexOf(e.lang) >= 0
            })
            else  dt = rows.filter(function (e) {
                return langsArr.indexOf(e.lang) >= 0
            })
            var d = d3.nest()
                .key(function (f) {
                    return f.keyword;
                })
                .entries(dt);

            //compute height
            var tagH = 0

            d.sort(function (a, b) {
                return b['values'].length - a['values'].length
            })

            d.forEach(function (e, i) {

                tagH += e['values'].length
            })

            //rescale the scale

            tagScale = d3.scale.linear().range([width / 37, width / 1.27]);
            tagScale.domain([0, tagH]).clamp(true)
            var vals = 0
            d.forEach(function (e, i) {

                e.y = vals;
                e.h = tagScale(e['values'].length)
                vals += e.h
            })

            //draw section

            tags = t.selectAll(".tag").data(d, function (e) {
                return e.key
            })

            var enter = tags.enter()
                .append("rect")

            //enter new elements
            enter.attr("class", function (d) {
                return "tag " + d.key.replace(/\s/g, '_');
            })
                .attr("y", 0)
                .attr("x", function (e) {
                    return e.y
                })
                .attr("height", listW)
                .attr("width", function (e) {
                    return e.h
                })
                .style("fill", function (e) {
                    return "#F0F0F0";
                })
                .style("stroke", "#fff")
                .on("click", function (d) {
                    if (!d3.select(this).classed("sel")) {

                        d.sel = true;
                        var index = tagsArr.indexOf(d.key);
                        if (index == -1) {
                            tagsArr.push(d.key);
                        }
                        d3.select(this).classed("sel", true)
                        loadImages();
                    }
                    else {
                        if(allTagSel) {
                        
                            d3.selectAll(fullCont+" .tag").classed("sel",false)
                            allTagSel=false;
                             d3.select(this).classed("sel", true);
                            tagsArr.push(d.key);
                        
                        }
                        else {                           
                            d.sel = false;
                            d3.select(this).classed("sel", false)
                            var index = tagsArr.indexOf(d.key);
                            // console.log(index)
                            if (index > -1) {
                                tagsArr.splice(index, 1);
                            }
                            checkAllSel();

                        }
                        loadImages();
                    }

                })
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);

            //transition on existing
            tags.transition().duration(500)
                .attr("x", function (e) {
                    return e.y
                })
                .attr("width", function (e) {
                    return e.h
                })
                .each("end", function () {

                    var rawW = t[0][0].getBBox().width;

                    t.transition().duration(100).attr("transform", "scale(1," + width / rawW + ")")
                })

            //remove old elements
            tags.exit().remove();

            //Text
            var txt = t.selectAll(".tag-txt")
                .data(d, function (e) {
                    return e.key
                })

            var txtEnt = txt.enter()
                .append("text")

            txtEnt
                .attr("class", "tag-txt")
                .attr("font-family", "serif")
                .attr("font-size", "1.1em")
                .attr("y", 0)
                .attr("x", function (e) {
                    return e.y
                })
                .attr("dx", "3")
                .attr("dy", "1.3em")
                .style("fill", "#222222")
                .text(function (d) {
                    console.log(d);

                    if(d.key.length*10> d.h && d.h>=40) {
                        return d.key.substr(0,parseInt(d.h/12))+"…";
                        console.log("1")
                    }
                    else if(d.key.length*10< d.h && d.h>=40) {
                        return d.key;
                        console.log("2")
                    }
                    else if(d.h<40) {
                        return d.key.substr(0,1)+"…";
                        console.log("3")
                    //return d.key
                }
                })

            txt.transition().duration(500)
                .attr("x", function (e) {
                    return e.y
                })
                 .text(function (d) {
                    console.log(d);

                    if(d.key.length*10> d.h && d.h>=60) {
                        return d.key.substr(0,parseInt(d.h/12))+"…";
                        console.log("1")
                    }
                    else if(d.key.length*10< d.h && d.h>=60) {
                        return d.key;
                        console.log("2")
                    }
                    else if(d.h<60) {
                        return d.key.substr(0,1)+"…";
                        console.log("3")
                    //return d.key
                }
                })

            txt.exit().remove()
        }


        var sortImages = function (s) {
            sortby = s;
            loadImages();
        }

        var loadImages = function () {

            $(imgsContainer).empty();
            $(imgsContainer).scrollTop(0);
            scrollEnd = false;
            load = 0;
            var whole = false
            if (!langsArr.length) {
                langsArr = allLangs
                whole = true;
            }

            currArray = rows.filter(function (e) {
                if (tagsArr.length)
                    return langsArr.indexOf(e.lang) >= 0 && tagsArr.indexOf(e.keyword) >= 0
                else return langsArr.indexOf(e.lang) >= 0
            })
                .sort(function (a, b) {
                    if (sortby==="rank") return a[sortby] - b[sortby]
                    else return b[sortby] - a[sortby]
                })


            if (whole) langsArr = [];

            count = currArray.length;
            if (count <= paginate) load = count
            else load = paginate


            sliced = currArray.slice(0, load - 1)
            currArray.slice(0, load - 1).forEach(function (e, i) {
                $(imgsContainer).append("<div class='img-cont' style='width:" + siz + "px;height:" + siz + "px;background:" + e.color + "'><img class='smallImg' style='opacity:0;' src='" + imgFolder + e.image + "'/></div>")
            })


            if (col) {
                $(fullCont + " .imgs img").hide();
            }

            $(fullCont + " .imgs").on("scroll", function (e) {

                if ($(this).scrollTop() >= this.scrollHeight - 800 && !scrollEnd) {

                    if (count <= load + paginate) {
                        scrollEnd = true;


                        currArray.splice(load, count - 1).forEach(function (e, i) {
                            $(imgsContainer).append("<div class='img-cont' style='width:" + siz + "px;height:" + siz + "px;background:" + e.color + "'><img class='smallImg' style=' opacity:0;' src='" + imgFolder + e.image + "'/></div>")
                        })

                        if (col) {
                            $(fullCont + " .imgs img").hide();
                        }

                    }

                    else {

                        currArray.slice(load, load + paginate - 1).forEach(function (e, i) {
                            $(imgsContainer).append("<div class='img-cont' style='width:" + siz + "px;height:" + siz + "px;background:" + e.color + "'><img class='smallImg' style='opacity:0;' src='" + imgFolder + e.image + "'/></div>")
                        })

                        if (col) {
                            $(fullCont + " .imgs img").hide();
                        }
                        load += paginate;
                    }
                }
            })
        }

        function changeSize(n) {
            siz = n;
            paginate = $(imgsContainer).width() * $(imgsContainer).height() / (siz * siz);
            if ($(fullCont + " .imgs").children.length <= paginate && currArray.length >= $(fullCont + " .imgs").children.length) {

                currArray.slice(load, load + paginate - 1).forEach(function (e, i) {
                    $(imgsContainer).append("<div class='img-cont' style='width:" + siz + "px;height:" + siz + "px;background:" + e.color + "'><img class='smallImg' style='opacity:0;' src='" + imgFolder + e.image + "'/></div>")
                })


                if (col) {
                    $(fullCont + " .imgs img").hide();
                }
                load += paginate;
            }
            $(fullCont + " .img-cont").css("width", n + "px")
            $(fullCont + " .img-cont").css("height", n + "px")
        }

        $(fullCont + " .elstc-img").on("click", function (e) {
            $(fullCont + " .imgs img").fadeIn(300);
            col = false;
            //$(".smallImg").css("opacity","1");
            checkOpacity = setInterval(function () {

                callImage(d3.selectAll(fullCont + " .smallImg").filter(function () {
                    return d3.select(this).style("opacity") == 0
                }), 0)


            }, 500);

            d3.select(fullCont + " .elstc-clr.active").classed("active", false);
            d3.select(this).classed("active", true)
        });

        $(fullCont + " .elstc-clr").on("click", function (e) {
            col = true;
            $(fullCont + " .imgs img").fadeOut(300, function () {
            })
            $(fullCont + " .smallImg").css("display", "none");
            clearInterval(checkOpacity);
            d3.select(fullCont + " .elstc-img.active").classed("active", false);
            d3.select(this).classed("active", true)
        });

        d3.select(window).on("resize", function () {

        });





        //LAUNCH MAIN METHOD

        viz_googleimages();
        checkAllSel();






        $(fullCont + " .rem-langs").on("click", function () {
            d3.selectAll(fullCont + " .lang.sel").classed("sel", false)
            if (!tagsArr.length) loadWhole()
            else {
                langsArr = [];
                elastify();
                loadImages();
            }
        })

        $(fullCont + " .rem-tags").on("click", function () {
            d3.selectAll(fullCont + " .tag.sel").classed("sel", false)
            tagsArr = []
            if (!langsArr.length) loadWhole()
            else {
                elastify();
                loadImages();
            }
        })


        $(fullCont + " .sort").on("click", function () {
            sortImages($(this).attr("data-value"))
            $(fullCont + " .sort-active").removeClass("sort-active")
            $(this).addClass("sort-active");
        })

        $(fullCont + ' .imgs').on('mousewheel', function (e) {
            e.stopPropagation();
            //$('#console').append('<br />B scrolled!');
        });

        //end elastic mess
        loaded = true


    };

    var callImage = function () {

        d3.selectAll(fullCont + " .smallImg")
            .filter(function () {
                return d3.select(this).style("opacity") == 0
            })
            .transition().duration(500)
            .delay(300)
            .style("opacity", 1);
    }


    function checkAllSel() {

        console.log("check")
        if($(fullCont+" .lang.sel").length==0) {
            d3.selectAll(fullCont+" .lang").classed("sel",true)
            allLangSel=true;
        }

        if($(fullCont+ " .tag.sel").length==0) {
             d3.selectAll(fullCont+" .tag").classed("sel",true)
            allTagSel=true;
        }
    }



    function preloadImages(srcs, imgs, callback) {
        var img;

        var remaining = srcs.length;
        var whole = remaining
        for (var i = 0; i < srcs.length; i++) {
            img = new Image();
            img.onload = function () {
                --remaining;
                if ((remaining / whole) * 100 % 5 >= 0 && ((remaining / whole) * 100 % 5 < 1))
                //$(".progress-bar").attr("aria-valuenow",srcs.length-remaining);
                    $(fullCont + " .progress-bar").width(((srcs.length - remaining) / srcs.length) * 100 + "%");

                if (remaining <= 0) {
                    callback();
                }
            };
            img.src = srcs[i];
            imgs.push(img);
        }
    }
}

elastic(".im-italy","#ita-elastic","data/img/italy/","data/italy_rgb.csv");
elastic(".im-china","#chi-elastic","data/img/china/","data/china_rgb.csv");