/*
SCROLL-FORCE.JS

ScrollY based animations

Rule:
  1. Object
  2. Property
  3. Start Value
  4. End Value
  5. Check type
  6. Check value Start
  7. Check value End
*/
function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
var rulelist=[];
function addrule(item,property_type,property,start_value,end_value,unit,check_type,check_start,check_end){
  if(property_type=='color'&&unit=="hex"){
    s=hexToRgb(start_value);
    e=hexToRgb(end_value);
    start_value=s;
    end_value=e;
    unit='rgb';
  }
  rulelist.push({
    type:"motion",
    item:item,
    property:property,
    property_type:property_type,
    start:start_value,
    end:end_value,
    unit:unit,
    check_type:check_type,
    check_start:check_start,
    check_end:check_end
  });
}
function addtrigger(func,direction,check_type,check_point){
  var s=check_point-300;
  var e=check_point+300;
  if(direction=="down"){
    dir=1;
  }
  else if(direction=="up"){
    dir=-1;
  }
  else{
    dir=0;
  }
  rulelist.push({
    type:"trigger",
    trigger:func,
    dir:dir,
    check_type:check_type,
    check_start:s,
    check_end:e
  });
}
var debug_scroll=1;
var scroll_max=screen.width;
var scroll_dir;
var prev_y;
function scroll_manager(){
  var i=0;
  var y=scrollY;
  if(y<=0){
    y=1;
  }
  var i=0;
  while (i<rulelist.length){
    var rule=rulelist[i];
        //Check if you need to apply the force
        var inbounds=1;
        var upper_bound=0;
        var lower_bound=0;
        if(rule.check_type=="percent"){
            upper_bound=screen.height(rule.check_end/100);
            lower_bound=screen.width(rule.check_start/100);
        }
        else{
          upper_bound=rule.check_end;
          lower_bound=rule.check_start;
          if(scroll_max<upper_bound){
            scroll_max=upper_bound;
          }
        }
        $("#the-scroll").height(scroll_max+screen.height);
        
        if(y<lower_bound){
          inbounds=0;
        }
        if(y>upper_bound){
          inbounds=0;
        }
        if(inbounds==1){
          //Now to calculate change
          if(rule.type=='trigger'){
            //CHECK direction
            console.log(dir);
            if(rule.dir==dir){
              rule.trigger();
            }
          }
          else if(rule.type=='motion'){
                if(rule.property_type=="color"){
                    var percentage_moved=(y-lower_bound)/(upper_bound-lower_bound);
                    var range={
                      r:rule.end.r-rule.start.r,
                      g:rule.end.g-rule.start.g,
                      b:rule.end.b-rule.start.b,
                      a:rule.end.a-rule.start.a,
                    };
                    var to_set={
                      r:range.r*percentage_moved+rule.start.r,
                      g:range.g*percentage_moved+rule.start.g,
                      b:range.b*percentage_moved+rule.start.b,
                      a:range.a*percentage_moved+rule.start.a,
                    }

                    if(debug_scroll)console.log(rule.item+" : "+rule.property+":"+to_set);
                    if(rule.unit=="rgba"){
                      $(rule.item).css(rule.property,"rgba("+to_set.r.toString().split(".")[0]+","+to_set.g.toString().split(".")[0]+","+to_set.b.toString().split(".")[0]+","+to_set.a.toString().split(".")[0]+")");
                    }
                    else if(rule.unit=="rgb"){
                      $(rule.item).css(rule.property,"rgb("+to_set.r.toString().split(".")[0]+","+to_set.g.toString().split(".")[0]+","+to_set.b.toString().split(".")[0]+")");
                    }
                    $(rule.item).css(rule.property,"rgba("+to_set.r.toString().split(".")[0]+","+to_set.g.toString().split(".")[0]+","+to_set.b.toString().split(".")[0]+","+to_set.a.toString().split(".")[0]+")");
                    if(debug_scroll)console.log("rgba("+to_set.r.toString().split(".")[0]+","+to_set.g.toString().split(".")[0]+","+to_set.b.toString().split(".")[0]+","+to_set.a.toString().split(".")[0]+")");
                }
                else{
                    var range=rule.end-rule.start;
                    var percentage_moved=(y-lower_bound)/(upper_bound-lower_bound);
                    var to_set=range*percentage_moved+rule.start;
                    if(debug_scroll)console.log(to_set);
                    if(rule.property_type=="style"){
                        $(rule.item).css(rule.property,to_set+rule.unit);
                    }
                    else if(rule.property_type=="attribute"){
                        $(rule.item).attr(rule.property,to_set+rule.unit);
                    }
                }
              }
        }
      i++;
    }
}
function scroll_direction_determine(){
  if(prev_y<scrollY){
    dir=1;
  }
  else if(prev_y>scrollY){
    dir=-1;
  }
  else{
    dir=0;
  }
  prev_y=scrollY;
}
$(document).ready(function(){

  $("body").html("<div id='the_page' style='position:absolute;background:none;'>"+$("body").html()+"</div><div id='the-scroll' style='background:none;position:absolute;top:0;left:0;z-index:-4;width:100%;'></div>");
  setInterval(function(){
        scroll_manager();
    },10);
  setInterval(function(){
          scroll_direction_determine();
  },100);
});

window.onload=function(){
  scrollTo(0,0);
}
