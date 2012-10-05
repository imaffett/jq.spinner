/**
 * jq.spinner.js
 * @author: appMobi
 * @copytright: 2012 appMobi
 * A spinner widget for jqMobi projects
 * You can tie them to input boxes, or just call one and retrieve the value.
 *
 *
 *
 * $.spinner is not tied to anything

 * $().spinner can tie itself to an input element

 * Options
    done - callback function to execute when "Done" is clicked
    cancel - callback function when "Cancel" is clicked
    slots - Array of items to show in the spinner
         items - items for each spinner
         default - default value for that spinner
         separator - Separator for values (like / in dates)
         template - use a built in default (month/day/year/minutes/seconds/ampm) for the item
    

* @examples

    $.spinner({ done: finish,
        slots: [{
            item: numbers,
            position: "right",
            default: 5
        }, {
            separator: "."
        }, {
            item: numbers,
            position: "right",
            default: 2
        }]
    });

    $(".spin")
        .spinner({
        slots: [{
            template: "month",
            position: "right"
        }, {
            separator: "/"
        }, {
            template: "day",
            position: "right"
        }, {
            separator: "/"
        }, {
            template: "year",
            position: "right"
        }]
    });                
*/

(function ($) {
    var padNum=function(val){
        if(val<10)
            return "0"+val;
        else
            return val+"";
    }
    $.spinner=function(opts){
         new spinner(document.documentElement,opts);
    };
    $.fn.spinner = function (opts) {
        var tmp, id;
        opts = opts || {}
        for (var i = 0; i < this.length; i++) {
            this[i].setAttribute("readonly","true");   
            $(this[i]).bind("click",function(e){
                var oldCB=opts.done||function(){}
                opts.done=function(items){
                    var self=this;
                    if(!self.element)
                        return;
                    self.element.value="";
                    items.forEach(function(obj){
                        self.element.value+=obj.key+"";
                    });
                    oldCB(items);
                }

                opts.defaultValue=this.value;
                if(this.slots){
                    opts.slots=this.slots;
                }
                opts.element=this;
                tmp = new spinner(this,opts);
                var handl=function(e){
                    tmp.orientationChange();
                };
                $(window).bind("orientationchange resize",handl);
                $("#jq-spinner").one("destroy",function(){
                    $(this).unbind("click");
                    $(window).unbind("orientationchange resize",handl)
                });
            });
        }
        return this;
    }

    //These are predefined templates that users can select from
    var defaultMonth={1:"January",2:"February",3:"March",4:"April",5:"May",6:"June",7:"July",8:"August",9:"September",10:"October",11:"November",12:"December"};
    var defaultDays=[];
    var currYear=new Date().getFullYear();
    for(var i=1;i<=31;i++)
        defaultDays.push({key:i,value:i});
    var defaultYears=[];
    for(i=1940;i<(currYear+20);i++)
        defaultYears[i]=i;

    var defaultHours=[];
    for(i=01;i<=12;i++)
        defaultHours[i]=i;
    var defaultMinutes=defaultSeconds=[];
    for(i=00;i<60;i++)
        defaultMinutes.push({key:padNum(i),value:padNum(i)});

    defaultSeconds=defaultMinutes;
    var defaultTime=[];
    defaultTime["AM"]="AM";
    defaultTime["PM"]="PM";

  


    var allows3D = 'm11' in new WebKitCSSMatrix();
    var translateOpen = allows3D ? "3d(" : "(";
    var translateClose = allows3D ? ",0)" : ")";
    var spinner = function (inputEl, opts) {
        if (!window.WebKitCSSMatrix) return;
        this.container = $.ui?$("#jQUi"):$(document.body);
        this.element=inputEl
        inputEl.id=inputEl.id||$.uuid();
        opts.cancel = opts.cancel || function () {};
        opts.done = opts.done || function () {}
        opts.slots = opts.slots || [];
        opts.defaultValue=opts.defaultValue||null;
        var self = this;
        if (this.container.find("#jq-spinner").length > 0){
            if(this.container.find("#jq-spinner").attr("data-el")!=inputEl.id){
                this.container.find("#jq-spinner").remove();
            }
            else
                return;
        }

        var markup = '<div id="jq-spinner" data-el="'+inputEl.id+'""><div class="header"></div><div id="wheels"><div id="slots"></div></div><div id="jq-spinner-frame"></div></div>';
        var el = this.container.append(markup).find("#jq-spinner");

        var btns = el.find(".header");
        var item = $('<div class="cancel">Cancel</div>');
        item[0].onclick = $.proxy(function () {
            opts.cancel();
            this.hide()
        },self);
        btns.append(item);
        var item = $('<div class="done">Done</div>');
        item[0].onclick = $.proxy(function () {
            var itms=this.getItems();
            opts.done(itms);
            this.hide()
        },self);
        btns.append(item);

       
        var wheels = el.find("#slots");
        var defaultValue=null;
        if(opts.defaultValue)
                defaultValue=opts.defaultValue;
    

        var separators={};
        for (var i = 0; i < opts.slots.length; i++) {
            if(opts.slots[i].separator)
            {
                var tmp=opts.slots[i].separator;
                tmp=tmp=="\/"?"\\/":tmp;
                separators[tmp]=tmp;
            }
        }
        var sepArr=[];
        for(var j in separators){
            sepArr.push(j);
        }
        var sepRegex=sepArr.join("|").trim();
        var defSplits=null;
        if(defaultValue) {
            var re = new RegExp(sepRegex,"g");
            defSplits=defaultValue.split(re);
        }
        for (var i = 0; i < opts.slots.length; i++) {
            var currSlot = opts.slots[i].item||[];
            var pos = opts.slots[i]['position']||"right";
            var def=opts.slots[i].default||"";
            if(opts.slots[i].template){
                switch(opts.slots[i].template){
                    case "month":currSlot=defaultMonth;
                    break;
                    case "day":currSlot=defaultDays;
                    break;
                    case "date":currSlot=defaultDates;
                    break;
                    case "year":currSlot=defaultYears;
                    break;
                    case "hours":currSlot=defaultHours;
                    break;
                    case "minutes":currSlot=defaultMinutes;
                    break;
                    case "seconds":currSlot=defaultSeconds;
                    break;
                    case "ampm":currSlot=defaultTime;
                    break;
                }
            }
            def+="";
            def=def.trim();
            var separator=opts.slots[i].separator||null;
            if(separator)
                    pos+=" separator";
            var txt = "<div class='" + pos + "' style='overflow:hidden;'><ul data-ind='"+i+"'>";
            this.itemPos[i]=0;
            if(separator){
                txt+="<li data-value='"+separator+"'>"+separator+"</li>";
            }
            else {
                if(defSplits&&defSplits.length>0)
                    def=defSplits.splice(0,1);
                var counter=0;
                for (var k in currSlot) {
                    var key=k;
                    var val=currSlot[k];
                    if(typeof(currSlot[k])=="object"){
                        key=currSlot[k].key;
                        val=currSlot[k].value;
                    }
                    txt += "<li data-value='" + key + "'>" + val+ "</li>";
                    
                    if(def&&(key+"")==def)
                        this.itemPos[i]=counter;
                    counter++;
                }
            }
            txt + "</ul></div>";
            var theItem = $(txt);
            wheels.append(txt);
        }

        var h=el.find("li").height();
        for(i=0;i<this.itemPos.length;i++){
            var item=el.find("ul[data-ind='"+i+"']").get(0);
            this.moveCSS3(item,{x:0,y:-1*(h*this.itemPos[i])});

        }
        el.bind("touchstart", function (e) {
            self.touchStart(e)
        });
        el.bind("touchmove", function (e) {
            self.touchMove(e)
        });
        el.bind("touchend", function (e) {
            self.touchEnd(e)
        });

        //If we are on a device, show it at the bottom, otherwise center it or put it near the element
        if(window.innerWidth<=600){
            el.get().style.webkitTransition = "all 0ms";

            el.css("-webkit-transform", "translate3d(0,0,0)");
            el.css("top", window.innerHeight + "px");
            el.css("width", "100%");
            $.asap(function(){
                el.get().style.webkitTransition = "all 200ms";
                var height = window.innerHeight - parseInt(el.css("height"));
                el.css("-webkit-transform", "translate3d(0,-280px,0)");
            })
        }
        else {
            //position in the center or near the element
            if(this.element!=document.documentElement&&this.element!=document.body){
                var status=20;
                var off=$(this.element).offset();
                var h=off.top+off.height;
                var orientation=window.orientation||0;
                var max=window.innerHeight-status;

                if(h>=max)
                    h=off.top+off.height-parseInt(el.height())-status;
                
                el.css("top",h+"px");
                el.css("left",off.left+"px");
                el.css("margin-top","auto");
                el.css("margin-left","auto");

            }
        }
        this.itemsCache=el.find("ul");
        this.spinner=el;

    };
    spinner.prototype = {
        values: [],
        keys: [],
        itemPos:[],
        movingEl: null,
        hide: function () {
            //We listen for the destroy event above, so we unwire events there

            //Animate down
            if(window.innerWidth<600){
                $("#jq-spinner").css("-webkit-transform","translate3d(0,0,0)");
                setTimeout(function(){
                    $("#jq-spinner").remove();
                },310);
            }
            else
                $("#jq-spinner").remove();
        },
        touchStart: function (e) {

            //if (e.target.tagName.toLowerCase() != "li") return;
            var $el = $(e.target);
            if(e.target.id=="jq-spinner-frame")
            {
                this.itemsCache.forEach(function(obj){
                    $obj=$(obj);
                    var off=$obj.offset();
                    if(e.touches[0].pageX>=off.left&&e.touches[0].pageX<=(off.left+off.width)){
                        $el=$(obj).find("li:nth-of-type(1)")
                    }
                });
                   
            }
            if($el.get(0).tagName.toLowerCase()!="li") return;
            //find parent
            $par = $el.parent();
            if($par.hasClass("readonly"))
                return;
            this.movingEl = $par.get(0);
            this.lockScreen(e);
            if (e.touches.length === 1) {
                this.movingElement = true;
                this.startY = e.touches[0].pageY;
                this.cssMoveStart = numOnly(new WebKitCSSMatrix(window.getComputedStyle(this.movingEl, null).webkitTransform).f);
                this.containerHeight = -1 * ($par.get(0).clientHeight - $el.height());
                this.liHeight = $el.height();
                this.startTime = e.timeStamp;
            }

        },
        touchMove: function (e) {
            if (!this.movingEl) return;
            if (e.touches.length > 1) {
                return this.touchEnd(e);
            }
            var rawDelta = {
                x: e.touches[0].pageX - this.startX,
                y: e.touches[0].pageY - this.startY
            };

            var movePos = {
                x: 0,
                y: 0
            };
            this.dy = e.touches[0].pageY - this.startY;
            this.dy += this.cssMoveStart;
            movePos.y = this.dy;

            if (movePos) this.moveCSS3(this.movingEl, movePos);

        },
        touchEnd: function (e) {
            if (!this.movingEl) return;
            var endPos = numOnly(new WebKitCSSMatrix(window.getComputedStyle(this.movingEl, null).webkitTransform).f);
            var ind=0;
             var movePos = {
                    x: 0,
                    y: 0
                };
            if (endPos > 0) {
                this.moveCSS3(this.movingEl, {
                    x: 0,
                    y: 0
                }, "150", "cubic-bezier(0.33, 0.66, 0.66, 1)");
            } else {
                var dist = endPos - this.cssMoveStart;
                var deceleration = 0.0012,
                    speed = Math.abs(dist) / (e.timeStamp - this.startTime),
                    newDist = (speed * speed) / (2 * deceleration),
                    newTime = 0,
                    newDist = newDist * (dist < 0 ? -1 : 1);
                newTime = speed / deceleration * .5;
                endPos += newDist;
                var cnt = endPos % this.liHeight * -1;
                var ind = parseInt(endPos / this.liHeight);

                if (cnt >= (this.liHeight / 2)) ind--;
                if (endPos < this.containerHeight) movePos.y = this.containerHeight;
                else movePos.y = ind * this.liHeight;
                if (endPos > 0) movePos.y = 0,ind=0;

                this.moveCSS3(this.movingEl, movePos, newTime, "cubic-bezier(0.33, 0.66, 0.66, 1)");

            }
            this.dy = 0;
            this.startY = 0;
            
            ind=movePos.y/this.liHeight*-1;
            this.itemPos[$(this.movingEl).data("ind")]=parseInt(ind);
            this.movingEl = null;
        },
        getItems:function(){
            var ret=[];
            var that=this;
            var cnt=this.container.find("#jq-spinner ul").each(function(ind){
                var $this=$(this);
                var li=$this.find("li:nth-of-type("+(that.itemPos[ind]+1)+")");
                var data=li.data("value")||li.html();
                var val=li.html();
                ret.push({key:data,value:val});
            });
            return ret;
        },
        moveCSS3: function (el, distanceToMove, time, timingFunction) {
            if (!time) time = 0;
            else time = parseInt(time);
            if (!timingFunction) timingFunction = "linear";

            if(!el) return;
            el.style.webkitTransform = "translate" + translateOpen + distanceToMove.x + "px," + distanceToMove.y + "px" + translateClose;
            el.style.webkitTransitionDuration = time + "ms";
            el.style.webkitBackfaceVisiblity = "hidden";
            el.style.webkitTransformStyle = "preserve-3d";
            el.style.webkitTransitionTimingFunction = timingFunction;
        },
        lockScreen: function (e) {
            e.preventDefault();
            e.stopPropagation();
        },
        orientationChange:function(e){
            //Handle orientation change and repositioning
            if(window.innerWidth<600) {
                this.spinner.get().style.webkitTransition = "all 0ms";

                this.spinner.css("-webkit-transform", "translate3d(0,-280px,0)");
                this.spinner.css("top", window.innerHeight + "px");
                this.spinner.css("left","0px");
                this.spinner.css("margin-top","auto");
                this.spinner.css("margin-left","auto");
            }
            else if(this.element!=document.documentElement&&this.element!=document.body){
                var status=20;

                var off=$(this.element).offset();
                var h=off.top+off.height;
                var max=window.innerHeight-status;
                if(h>=max)
                    h=off.top+off.height-parseInt( this.spinner.height())-status;
                console.log(h);
                 this.spinner.css("top",h+"px");
                 this.spinner.css("left",off.left+"px");
                 this.spinner.css("margin-top","auto");
                 this.spinner.css("margin-left","auto");

            }   
        }
    }

})(jq);