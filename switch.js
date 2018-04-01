(function(){
    
    var _prefix=(function(temp){
        var aPrefix=["webkit","Moz","o","ms"];
            
        for(var i in aPrefix){
           var props =aPrefix[i]+"Transition";
            if(temp.style[props]!==undefined){
                return "-"+aPrefix[i].toLowerCase()+"-"
            }
        }
    })(document.createElement("div"));

    var PageSwitcher=function($element,options){
        //配置参数
        this.settings=$.extend(true,$.fn.myPlugin.default,options||{});
        //传入的JQ对象保存在属性里
        this.$element=$element;
        this.init();
    }
    PageSwitcher.prototype={
        init:function(){
             var that = this;
             //获取需要配置的组件
             that.selectors=that.settings.selectors;
             that.$sections=that.$element.find(that.selectors.sections);
             that.$section=that.$sections.find(that.selectors.section);
             that.vertical=that.settings.vertical;
             that.SectionCount=that.$section.length;
             that.canscroll = true;
             that.index=(that.settings.index>0&&that.settings.index<that.SectionCount)?that.settings.index:0;
             if(!that.vertical){
                that._horizen()
             }
             if(that.settings.has_tab){
                that._createtab_Btn()
             }
             that._initevent()
        },
        //切换上一张
        prev:function(){
            if(this.index>0){
                this.index --
            }else if(this.settings.loop){
                this.index=this.SectionCount-1
            }

            this._scrollPage();
        },
        //切换下一张
        next:function(){

            if(this.index<this.SectionCount-1){
                this.index ++
            }else if(this.settings.loop){
                this.index=0;
            }

            this._scrollPage();
        },
        //使section水平
        _horizen:function(){
            var sectionsWidth=(this.SectionCount*100)+"%";
                sectionWidth=(100/this.SectionCount).toFixed(2)+"%";
            this.$sections.width(sectionsWidth);
            this.$section.width(sectionWidth).css("float","left")   
            if(this.index){
                    this._scrollPage(true);
                } 
            
        },
        //创建切换按钮
        _createtab_Btn:function(){
            var btnClass=this.selectors.tab_Btn.substring(1);
            this.activeClass=this.selectors.active.substring(1);
            var tab_BtnHTML="<ul class="+btnClass+">";
            for (var i=0;i<this.SectionCount;i++){
                tab_BtnHTML +="<li></li>";
            }
            this.$element.append(tab_BtnHTML+"</ul>")
            var Alltab_Btn=this.$element.find(this.selectors.tab_Btn);
            this.tab_Btn=Alltab_Btn.find("li");
            this.tab_Btn.eq(this.index).addClass(this.activeClass)
            if(this.vertical){
                Alltab_Btn.addClass("vertical")
            }else{
                Alltab_Btn.addClass("horizontal")
            }
        },
        //取得当前高度（宽度）
        switchLength:function(){
            return this.vertical?this.$element.height():this.$element.width()
        },
        _scrollPage:function(init){
            
            var me=this,
                dest=this.$section.eq(this.index).position();
            
            if(!dest){return}


            me.canscroll = false;
            if(_prefix){

                me.$sections.css(_prefix+"transition","all "+me.settings.duration+"ms "+me.settings.easing)
                var translate=me.vertical?"translateY(-"+dest.top+"px)":"translateX(-"+dest.left+"px)";
                me.$sections.css(_prefix+"transform",translate)
                
            }else{
                var animateCss=me.vertical?{top:-dest.top}:{left:-dest.left};
                me.$sections.animate(animateCss,me.settings.duration,function(){
                     me.canscroll=true;
                     if(me.settings.callback&& $.type(me.settings.callback)=="function"){
                    me.settings.callback()
                }
            });
            }
            if(me.settings.has_tab){
                    me.tab_Btn.eq(me.index).addClass(me.activeClass).siblings("li").removeClass(me.activeClass);
            }

        },
        _initevent:function(){
            var me=this//保存pageSWITCH的实例对象为me
            me.$element.on("click",me.selectors.tab_Btn+" li",function(){
                me.index=$(this).index();
                me._scrollPage();
            });
            //鼠标滚轮事件
            me.$element.on("mousewheel DOMMouseScroll",function(e){
                 e.preventDefault()
                var delta=e.originalEvent.wheelDelta||-e.originalEvent.detail;//后面是火狐浏览器判断方向
                   if(me.canscroll){if(delta>0&&(me.index&&!me.settings.loop||me.settings.loop)){
                        me.prev()
                    }else if(delta <0&&(me.index<(me.SectionCount-1)&&!me.settings.loop||me.settings.loop)){
                        me.next()
                    }}
 
                   

            });
            //键盘事件
            if(me.settings.keyboard){
                $(window).on("keydown",function(e){
                    var keyCode=e.keyCode;
                    if(keyCode==37||keyCode==38){
                        me.prev()
                    }else if(keyCode==39||keyCode==40){
                        me.next();
                    }
                })
            };
            //窗口大小改变时
            $(window).resize(function(){
                var currentLength=me.switchLength()
                //JQ里的offset（）获得当前元素相对于文档的偏移
                    offset=me.settings.vertical?me.$section.eq(me.index).offset().top:me.$section.eq(me.index).offset().left;
                if(Math.abs(offset)>currentLength/2&&me.index<(me.SectionCount-1)){
                      me._scrollPage()
                }

            });
            if(_prefix){
            me.$sections.on("transitionend webkitTransitionEnd",function(){
                me.canscroll=true;

                if(me.settings.callback&& $.type(me.settings.callback)=="function"){
                    me.settings.callback()
                    
                }
            })}

        }
            

    }
    
    $.fn.myPlugin=function(options){
        return this.each(function(){
            //each返回的是DOM对象，用$()变为jquery对象，$开头表示jq对象
            var $that=$(this),
                instance=$that.data("PageSwitcher");
            if(!instance){
                instance=new PageSwitcher($that,options);
                $that.data("PageSwitcher",instance);
            }
            if (options=="init"){
                instance[options]()
            }
        })
    }
     $.fn.myPlugin.default={
        //要实现的组件class
        selectors:{
            sections:".sections",//页面容器
            section:".section",//多个页面
            tab_Btn:".tab_Btn",//切换按钮
            active:".active"//当前样式
        },
        index:0,//索引值
        easing:"ease",//动画效果,
        duration:500,//动画耗时
        loop:false,//是否循环
        has_tab:false,//是否有切换按钮
        keyboard:true,//键盘能否控制切换
        vertical:true,//垂直切换，false为水平
        fn:""//回调函数
    }
    $(function(){ $('[data-PageSwitch]').myPlugin()})
  


    
})(jQuery)