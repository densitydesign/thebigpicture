function elastic(fullCont,vizCont, imgFolder, imgFile) {

    var col = true,
        rows,
        siz = 12,
        data,
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
        rows;


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


        checkOpacity = setInterval(callImage, 500);
    })


    var init;
    init = function () {

        $(fullCont + ".progress-cont").fadeOut(500, function () {
            $(fullCont + '.googleimages').css("opacity", 1)
        });

        data = d3.nest()
            .key(function (d) {
                return d.lang;
            })
            .key(function (d) {
                return d.keyword;
            })
            .entries(rows);

        data.forEach(function (e, i) {
            allLangs.push(e.key);
        })

        var maxH = 0

        data.forEach(function (d, i) {
            d.count = 0;
            d.y = maxH
            d['values'].forEach(function (e, j) {
                maxH += e['values'].length
                d.count += e['values'].length

            });
        });

        data.sort(function (a, b) {
            return b.count - a.count
        })


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

            //scale function
            langScale = d3.scale.linear().domain([0, maxH]);
            langScale.range([0, width])

            //draw lang rects
            langs = svg.selectAll(".lang").data(data)
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
                        d.sel = false;
                        d3.select(this).classed("sel", false)
                        var index = langsArr.indexOf(d.key);
                        if (index > -1) {
                            langsArr.splice(index, 1);
                        }
                        if (!langsArr.length) {
                            /*	tagsArr=[];
                             $(".tag.sel").removeClass("sel")
                             loadWhole(); */

                        }
                        //	else{
                        elastify();
                        loadImages();
                        //	}
                    }

                });

            //labels for languages
            svg.selectAll(".lang-txt")
                .data(data)
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
                        console.log("select")
                        d.sel = true;
                        var index = tagsArr.indexOf(d.key);
                        if (index == -1) {
                            tagsArr.push(d.key);
                        }
                        d3.select(this).classed("sel", true)
                        loadImages();
                    }
                    else {
                        console.log("deselect")
                        d.sel = false;
                        d3.select(this).classed("sel", false)
                        var index = tagsArr.indexOf(d.key);
                        // console.log(index)
                        if (index > -1) {
                            tagsArr.splice(index, 1);
                        }
                        loadImages();
                    }

                });

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
                .attr("dx", "0")
                .attr("dy", "1.3em")
                .style("fill", "#222222")
                .text(function (d) {
                    return d.key
                })

            txt.transition().duration(500)
                .attr("x", function (e) {
                    return e.y
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

        viz_googleimages();


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