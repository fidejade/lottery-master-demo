
var award = {
    state: false,
    awards: [{
        id: "id_5",
        idx: 0, //序号 顺时针从0开始
        name: "1G流量"
    }, {
        id: "id_1",
        idx: 1,
        name: "电影票",
    }, {
        id: "id_2",
        idx: 2,
        name: "10元翼支付",
    }, {
        id: "id_4",
        idx: 3,
        name: "500M流量",
    }, {
        id: "id_6",
        idx: 4,
        name: "1G电信全国流量",
    }, {
        id: "id_3",
        idx: 5,
        name: "500元翼支付",
    }, {
        id: "id_7",
        idx: 6,
        name: "10元翼支付",
    }, {
        id: "id_8",
        idx: 7,
        name: "500M流量",
    }]
};
//提示方法  代替alert
var toastDialog=null,toastTimer=0;
$.toast = function(msg,timer){
    if(!toastDialog){
        var html = [];
        html.push('<section class="cm-toast" id="cm-toast">');
        html.push('<p><span class="cm-toast-main" id="cm-toast-msg">');
        html.push('</p> </section>');
        toastDialog = $(html.join('')).appendTo($("body"));
    }

    toastDialog.find("#cm-toast-msg").text(msg);
    toastDialog.show();

    if(toastTimer){
        window.clearTimeout(toastTimer);
    }

    toastTimer = window.setTimeout(function(){ toastDialog.hide();  },timer || 3000);

};
//验证电话号码

function secMobile(mobile) {

    if(mobile.length != 11){
        return "";
    }
    return mobile.substring(0,3) + "****" + mobile.substring(7);
}
function getUrlParam(name, scope) {
    var arr,
        reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");

    if (scope) {
        arr = scope.match(reg);
    } else {
        arr = window.location.search.substr(1).match(reg);
    }

    if (arr) {
        return unescape(arr[2]);
    } else {
        return null;
    }
}
// 0:操作成功
// 1:操作失败,请稍后重试
// 2:用户未抽奖
// 3:用户已抽奖
// 6:验证参数失败
// 73:活动已过期
var awardState=0,
    awardDesc=0,
    server = 'http://180.96.7.219:9880',
    loadFlag=false,
    awardInfo=null,
    token=getUrlParam('token');
if (!token){
    $.toast("请勿非法访问")
}
function awardFn(item,data) {
    if(award.state){
        return;
    }
    award.state = true;
    var angles = 360 - item.idx * (360 / award.awards.length) - 180 / award.awards.length;
    $('#award-bg').stopRotate();
    $('#award-bg').rotate({
        angle: 0,
        animateTo: angles + 1800,
        duration: 5000,
        callback: function () {
            award.state = false;
            awardState=2;
            $("#award-info").show().html( "<div><span>"+secMobile(data.self.mobile)+"</span>抽中<span>"+data.self.reward+"</span></div>")
            $("#award-tips").html("回答3个问题就能立刻领取精品哦！")
            getAnswer(data.self);
            //TODO callback
        }

    });
}

$("#award-pointer").click(function () {
 if (!loadFlag){
     return
 }
 if (awardState==3){
     $("body").addClass("modal")
     $(".modal-in,.msg-small").show()
     $(".msg").html("对不起，您的抽奖权限已用完，谢谢参与");
     $(".msg-btn").html("<button class='m-btn'>知道了</button>")
     return false
 }else if (awardState==2){
     getAnswer();
     return
 }
    $.getJSON(server+'/link/activity/lottery?callback=?&token=' + token,function (data) {
        if (data.status==0){
            var rid = data.self.id,
                award_item = null;
            $.each(award.awards,function (i, elem) {
                if(elem.id == "id_" + rid){
                    award_item = elem;
                }
            });
            if(!award_item){
                $.toast('系统繁忙，请稍后再试');
            }else{
                awardState = 2;
                awardFn(award_item,data);
            }
        }
    })
})
//
$.getJSON(server + '/link/activity/reward?callback=?&token=' + token,function (data) {
    loadFlag=true;
    if (data.status==0){
        awardState=data.self.state;
        if (awardState==3||awardState==2){
            $("#my-award").css("background","rgba(0,0,0,.2)")
            if(awardState==3){
                $("#award-info").html( "<div><span>"+secMobile(data.self.mobile)+"</span>抽中<span>"+data.self.reward+"</span></div>")
                if (awardDesc){
                    $("#award-tips").html(data.self.desc)
                }
                else{

                    $("#award-tips").html("我们将在五个工作日内为您充值")
                }
            }
            else{
                $("#award-info").show().html( "<div><span>"+secMobile(data.self.mobile)+"</span>抽中<span>"+data.self.reward+"</span></div>")
                $("#award-tips").html("回答3个问题就能立刻领取精品哦！")
                getAnswer(data.self);
            }
        }

        if (data.list&&data.list.length>0){
            var html=[]
            $.each(data.list,function (i,ele) {
                html.push('<div class="award-item"><span>'+secMobile(ele.mobile)+'</span>抽中<span>'+ele.reward+'</span></div>')
            })
            $("#award-list").html(html.join(''))
        }
        else{
            $("#award-list").html("当前没有人中奖！")
        }

    }
    else if (data.status==6){
        $.toast("请勿非法访问")
    }
    else if(data.status==1){
        $.toast("操作失败，请稍后重试")
    }
    else if(data.status==73){
        $.toast("活动已过期")
    }
});
function getAnswer(info) {
    if (info){
        awardInfo=info;
    }
    console.log(info);
    $("body").addClass("modal")
    $(".modal-in,.msg-big").show()
    $(".msg-title").html("恭喜你中奖啦！")
    $(".msg").html(' 恭喜你获得了<span>'+awardInfo.reward+'</span>，回答3个问题就能立刻立刻领取奖品哦！')
    $("#cancel").html("取消")
    $("#btn").html("去答题").unbind('click').click(function () {
        var html=[];
        $(".msg-title").html("回答问题领奖品");
        html.push('<div class="msg-li"> <div class="question">1、掌上大学是哪款APP的简称？</div> <div class="answer"> ' +
            '<input type="radio" name="que" id="que-ans1" value="1"> <label for="que-ans1">A.掌上大学</label> ' +
            '<input type="radio" name="que" id="que-ans2" value="2"> <label for="que-ans2">B.天翼生活</label> </div> </div> ')
        html.push('<div class="msg-li"> <div class="question">2、掌上大学app没有以下哪个功能？</div> <div class="answer"> ' +
            '<input type="radio" name="que1" id="que1-ans1" value="1"> <label for="que1-ans1">A.直播</label> ' +
            '<input type="radio" name="que1" id="que1-ans2" value="2"> <label for="que1-ans2">B.话费充值</label> ' +
            '<input type="radio" name="que1" id="que1-ans3" value="3"><label for="que1-ans3">C.发红包</label>' +
            '<input type="radio" name="que1" id="que1-ans4" value="4"> <label for="que1-ans4">D.买菜</label> </div> </div>')
        html.push('<div class="msg-li"> <div class="question">3、掌大直播中，以下哪种表达无法向主播传递你的喜爱？</div> <div class="answer"> ' +
            '<input type="radio" name="que2" id="que2-ans1" value="1"><label for="que2-ans1">A.打赏</label> ' +
            '<input type="radio" name="que2" id="que2-ans2" value="2"><label for="que2-ans2">B.发送“我爱你”</label> ' +
            '<input type="radio" name="que2" id="que2-ans3" value="3"> <label for="que2-ans3">C.给主播点亮</label> ' +
            '<input type="radio" name="que2" id="que2-ans4" value="4"><label for="que2-ans4">D.在心里鼓掌</label></div></div>')
        $(".msg").html(html.join(''))
        $("#cancel").html("取消")
        $("#btn").html("去领奖").unbind("click").click(function () {
            //     //判断 第一个选项是否正确
            var $answer1=$("input:radio[name=que]:checked").val(),
                $answer2=$("input:radio[name=que1]:checked").val(),
                $answer3=$("input:radio[name=que2]:checked").val();
            var $answers=[$answer1,$answer2,$answer3];
            if ($answers.length!=3){
                $.toast("回答完三个问题才可以领奖！")
                return false
            }
            console.log(parseInt($answers[0]))
            if (parseInt($answers[0])!=1){
                $.toast("请检查答案是否正确");
                return false;
            }
            $.getJSON(server + '/link/activity/receive?callback=?&token=' + token + "&result=" + $answers.join(','),function (data) {
                if (data.status==0){
                    awardState=3;
                    var msg=data.self.reward;
                    if (data.self.desc){
                        msg+=data.self.desc;
                    }
                    $(".msg-title").html("恭喜你！")
                    $(".msg").html("问题回答的很完美，恭喜你获得了"+msg+"");
                    $(".msg-big").show()
                    $("#cancel").html("")
                    $("#btn").html("知道啦").css("marginLeft","1rem").unbind("click").click(function () {
                        $(".modal-in,.msg-big" ).hide(); $("body").removeClass('modal')
                    })
                    $("#award-info").html( "<div><span>"+secMobile(data.self.mobile)+"</span>抽中<span>"+data.self.reward+"</span></div>")
                    if(data.self.desc){
                        $("#award-tips").html(data.self.desc)
                    }
                    else{
                        $("#award-tips").html("我们将在五个工作日内为您充值！")
                    }
                }
                else if(data.status==60){
                    $.toast("非电信校园用户，无法领取流量，请联系客服")
                }
                else if (data.status==-1){
                    $.toast("系统繁忙，请重试")
                }
            })

        })
    })
}
//关闭遮罩
$(document).on("click",'.cancel,.m-btn',function () {
    $(".modal-in,.msg-big" ).hide(); $("body").removeClass('modal')
})
// // getSelf()
// //获取当前自己抽中的奖品
// function getSelf() {
//
//     $.ajax({
//         type:'get',
//         dataType:'jsonp',
//         url:"http://180.96.7.219:9880/link/activity/lottery?token="+token,
//         callback:"test",
//         success:function (data) {
//             if (data.status==3){
//                 window.localStorage.setItem('item',data.self.reward)
//                 awardState=data.self.state;
//                 awardDesc=data.self.desc;
//                 if (awardState==2||awardState==3){
//                     if (awardState==3){
//                         $("#award-info").html( "<div><span>"+data.self.mobile+"</span>抽中<span>"+data.self.reward+"</span></div>")
//                         if (awardDesc){
//                             $("#award-tips").html(data.self.desc)
//                         }
//                         else{
//
//                             $("#award-tips").html("我们将在五个工作日内为您充值")
//                         }
//                         $("#award-pointer").click(function (){
//                             $("body").addClass("modal")
//                             $(".modal-in,.msg-small").show()
//                             $(".msg").html("对不起，您的抽奖权限已用完，谢谢参与");
//                             $(".msg-btn").html("<button class='m-btn'>知道了</button>")
//                             $('#award-bg').stopRotate();
//                         })
//                     }
//                     else{
//                         $("#award-pointer").click(function () {
//                             $("body").addClass("modal")
//                             $(".modal-in,.msg-big").show()
//                             $(".msg-title").html("恭喜你中奖啦！")
//                             $(".msg").html(' 恭喜你获得了<span>'+data.self.reward+'</span>，回答3个问题就能立刻立刻领取奖品哦！')
//                             $(".modal-foot").html(
//                                 '<a href="javascript:void(0)" class="cancel">取消</a> <button class="btn">去答题</button>'
//                             )
//                         })
//
//                     }
//                 }
//                 $("#my-award").show();
//
//                 //不可以再抽奖
//
//             }
//             else if(data.status==1){
//                 alert("操作失败，请稍后重试")
//             }
//             else if (data.status==73){
//                 alert("对不起，活动已过期")
//             }
//             else if(data.status==2){
//                 $("#award-pointer").click(function () {
//                     var rid = parseInt(award.awards.length * Math.random()) +1; // get random , from ajax..
//                     var award_item ={};
//
//                     $.each(award.awards,function (i, elem) {
//                         if(elem.id == "id_" + rid){
//                             award_item = elem;
//                         }
//                     });
//                     window.localStorage.setItem('item',award_item.name)
//                     console.log(rid);
//                     console.log( award_item);
//                     awardFn(award_item);
//
//                 });
//             }
//         }
//     })
//
// }
// //获取其他用户奖品列表
// // getUsers()
// function getUsers() {
//     $.ajax({
//         type:'get',
//         dataType:'jsonp',
//         url:"http://180.96.7.219:9880/link/activity/reward?token="+token,
//         callback:"test",
//         success:function (data) {
//            awardState=data.self.state;
//             if (data.status==0){
//                 if (data.list&&data.list.length>0){
//                     var html=[]
//                     $.each(data.list,function (i,ele) {
//                         html.push('<div class="award-item"><span>'+ele.mobile+'</span>抽中<span>'+ele.reward+'</span></div>')
//                     })
//                     $("#award-list").html(html.join(''))
//                 }
//                 else{
//                     $("#award-list").html("当前没有人中奖！")
//                 }
//             }
//         }
//     })
// }


// $(document).on('click','.btn',function () {
//     var html=[];
//     $(".msg-title").html("回答问题领奖品");
//     html.push('<div class="msg-li"> <div class="question">1、掌上大学是哪款APP的简称？</div> <div class="answer"> ' +
//         '<input type="radio" name="que" id="que-ans1" value="A"> <label for="que-ans1">A.掌上大学</label> ' +
//         '<input type="radio" name="que" id="que-ans2" value="B"> <label for="que-ans2">B.天翼生活</label> </div> </div> ')
//     html.push('<div class="msg-li"> <div class="question">2、掌上大学app没有以下哪个功能？</div> <div class="answer"> ' +
//     '<input type="radio" name="que1" id="que1-ans1" value="A"> <label for="que1-ans1">A.直播</label> ' +
//     '<input type="radio" name="que1" id="que1-ans2" value="B"> <label for="que1-ans2">B.话费充值</label> ' +
//     '<input type="radio" name="que1" id="que1-ans3" value="C"><label for="que1-ans3">C.发红包</label>' +
//     '<input type="radio" name="que1" id="que1-ans4" value="D"> <label for="que1-ans4">D.买菜</label> </div> </div>')
//     html.push('<div class="msg-li"> <div class="question">3、掌大直播中，以下哪种表达无法向主播传递你的喜爱？</div> <div class="answer"> ' +
//     '<input type="radio" name="que2" id="que2-ans1" value="A"><label for="que2-ans1">A.打赏</label> ' +
//     '<input type="radio" name="que2" id="que2-ans2" value="B"><label for="que2-ans2">B.发送“我爱你”</label> ' +
//     '<input type="radio" name="que2" id="que2-ans3" value="C"> <label for="que2-ans3">C.给主播点亮</label> ' +
//     '<input type="radio" name="que2" id="que2-ans4" value="D"><label for="que2-ans4">D.在心里鼓掌</label></div></div>')
//     $(".msg").html(html.join(''))
//     $(".modal-foot").html(
//         '<a href="javascript:void(0)" class="cancel">取消</a> <button id="getAward">去领奖</button>'
//     )
// })

//判断 去领奖

// $(document).on("click",'#getAward',function () {
//     //判断 第一个选项是否正确
//     var $answer1=$("input:radio[name=que]:checked").val()
//     var $answer2=$("input:radio[name=que1]:checked").val()
//     var $answer3=$("input:radio[name=que2]:checked").val()
//     if($answer1!=="A"||$answer2!=="D"||$answer3!=="D"){
//         $(".msg-big").hide()
//         $(".msg-small").show()
//         $(".msg").html("真可惜，您回答错了，与奖品擦肩而过，谢谢参与");
//         $(".msg-btn").html("<button class='m-btn'>知道啦</button>")
//     }
//     else if ($answer1=="A"||$answer2=="D"||$answer3=="D"){
//       var item= window.localStorage.getItem('item')
//         $(".msg").html("问题回答的很完美，恭喜你获得了"+item+"");
//         $(".msg-big").show()
//         $(".modal-foot").html("<button class='m-btn' id='get-award'>知道啦</button>")
//         $(".m-btn").css("marginLeft","1.2rem")
//         window.localStorage.removeItem('item')
//     }
//
// })

