var express = require('express');
var router = express.Router();
const md5 = require('blueimp-md5')
const models = require('../db/models')
//const UserModel = models.getModel('user')
const _filter = {'pwd': 0, '__v': 0} // 查询时过滤掉
const sms_util = require('../util/sms_util')
const users = {}
const ajax = require('../api/ajax')
var svgCaptcha = require('svg-captcha')
var pool = require("../util/pool");

/*
密码登陆
 */
router.post('/login_pwd', function (req, res) {
  const name = req.body.name
  const pwd = md5(req.body.pwd)
  const captcha = req.body.captcha.toLowerCase()
  //输出用户输入参数是否正确  captcha 你输入验证码字符串
  console.log('/login_pwd', name, pwd, captcha);
  //服务器中保存验证码    二个相同
  console.log("server_", req.session)

  // 可以对用户名/密码格式进行检查, 如果非法, 返回提示信息
  if(captcha!==req.session.captcha) {
    return res.send({code: -1, msg: '验证码不正确'})
  }
  // 删除保存的验证码
   delete req.session.captcha

   var sql = "SELECT  id FROM dd_login WHERE uname = ? AND upwd = ?";
   pool.query(sql,[name,pwd],(err,result)=>{
    if(err)throw err;
    if(result.length===0){
      res.send({code:-1,msg:"用户名或密码有误"})
    }else{ 
     var id = result[0].id;
     //登录成功在服务器端将登录凭证保存
     req.session.userid = id;
     return res.send({code: 1, msg: '登录成功',data:{id}})
    }
   })

})

/*
一次性图形验证码
 */
router.get('/captcha', function (req, res) {
  var captcha = svgCaptcha.create({
    ignoreChars: '0o1l',
    noise: 2,
    color: true,
	size:4,
  });
  req.session.captcha = captcha.text.toLowerCase();
  console.log(2,req.session.captcha);
  res.type('svg');
  res.send(captcha.data)
});



/*
根据sesion中的userid, 查询对应的user
 */
router.get('/userinfo', function (req, res) {
  res.send({code: 1, msg: '正确',data:{id:1,name:"tom",phone:"13999999999"}})
})




router.get('/logout', function (req, res) {
  // 清除浏览器保存的userid的cookie
  delete req.session.userid
  // 返回数据
  res.send({code: 0})
})

//后台添加接口uniapp 商城
//1:返回轮播图
router.get("/getSwiper",function(req,res){
	var rows = [
		{id:1,url:"images/1.jpg"},
		{id:2,url:"images/2.jpg"},
		{id:3,url:"images/3.jpg"},		
		];
	res.send({code:1,message:rows})
})

router.get("/getGoods",function(req,res){
	var rows=[
		{id:1,conde:1,title:"小米手机",zhaiyao:"最强手机",img_url:"images/xm.jpg",sell_price:2195,market_price:2278,stock_quanti:11},
		{id:2,conde:1,title:"小米手机",zhaiyao:"最强手机",img_url:"images/xm.jpg",sell_price:2195,market_price:2278,stock_quanti:11},
		{id:3,conde:1,title:"小米手机",zhaiyao:"最强手机",img_url:"images/xm.jpg",sell_price:2195,market_price:2278,stock_quanti:11},
		{id:4,conde:1,title:"小米手机",zhaiyao:"最强手机",img_url:"images/xm.jpg",sell_price:2195,market_price:2278,stock_quanti:11},
		{id:5,conde:1,title:"小米手机",zhaiyao:"最强手机",img_url:"images/xm.jpg",sell_price:2195,market_price:2278,stock_quanti:11},
	];
res.send({conde:1,message:rows})
})

router.get("/getinfo",function(req,res){
	var id=req.query.id;
	var obj={
		id,
		title:"小米手机",
		add_time:"2019-10-11 10:12:11",
		stock_quantity:11,
		market_price:2499,
		sell_price:2199,
		goods_no:"SD190001928",
	}
	res.send({cond:1,message:obj})
})

router.get("/getimages",function(req,res){
	var sql="SELECT id,title,img_url FROM shopimg";
	pool.query(sql,(err,result)=>{
		if(err)throw err;
		if(result.length!=0){
			res.send({cond:1,message:result})
		}
	})
	
})

router.get("/getinfocontent",function(req,res){
	var result={
		content:`
		<h1>最新款手机</h1>
		<div>
			<h3>小米3000</h3>
			<img src="http://127.0.0.1:4000/images/xm/1.jpg"></img>
			<h3>小米3000</h3>
			<img src="http://127.0.0.1:4000/images/xm/2.jpg"></img>
			<h3>小米3000</h3>
			<img src="http://127.0.0.1:4000/images/xm/3.jpg"></img>
		</div>
		`
	}
	res.send({code:1,message:result})
})

router.post("/reg",(req,res)=>{
	var reg=/^[a-z0-9]{3,11}$/i;
	var uname=req.body.uname;
	var upwd=req.body.upwd;
	
	var code=req.body.code;
	if(code!=req.session.captcha){
		return res.send({cose:-1,message:"验证码不正确"})
	}
	delete req.session.captcha
	
	if(!reg.test(uname)){
		res.send({code:-1,message:"用户名或密码有误"});
		return;
	}
	if(!reg.test(upwd)){
		res.send({code:-2,message:"用户名或密码有误"});
		return;
	}
	upwd=md5(upwd);
	var sql="INSERT INTO shopuser VALUES(null,?,?)";
	pool.query(sql,[uname,upwd],(err,result)=>{
		if(err)throw err
		if(result.affectedRows>0){
			res.send({code:1,message:"注册成功"})
		}else{
			res.send({code:-3,message:"注册失败"})
		}
	})
	
})

router.get("/existsUname",(req,res)=>{
	var uname=req.query.uname;
	var sql="SELECT id from shopuser WHERE uname =?";
	pool.query(sql,[uname],(err,result)=>{
		if(err)throw err
		if(result.length>0){
			res.send({code:1,message:"已存在"})
		}else{
			res.send({conde:-1,message:"可以使用"})
		}
	})
})

router.get("/login",(req,res)=>{
	var code=req.body.code;
	var r=req.session.captcha;
	var regcode=/^[a-z0-9]{4}$/;
	if(!regcode.test(code)){
		res.send({code:-2,message:"验证码不正确"})
		return;
	}
	if(code!=r){
		res.send({code:-1,message:"验证码不正确"})
		return;
	}
	var uname=req.body.uname;
	var upwd=req.body.upwd;
	var reg=/^[a-z0-9]{3,12}$/;
	if(!reg.test(uname)){
		res.send({code:-3,message:"用户名或密码不正确"})
		return;
	}
	if(!reg.test(upwd)){
		res.send({code:-4,message:"用户名或密码不正确"})
	}
	upwd=md5(upwd)
	var sql="SELECT id FROM shopuser WHERE uname=? AND upwd=?";
	pool.query(sql,[uname,upwd],(err,result)=>{
		if(err)throw err;
		if(result.length==0){
			res.send({code:-3,message:"用户名或密码有误"})
		}else{
			req.session.uid=result[0].id;
			res.send({code:1,message:"登录成功"})
		}
	})
})

router.get("/getnickname",(req,res)=>{
	if(!req.session.uid){
		res.send({code:1,message:"请登录"})
		return;
	}
	var id=req.session.uid;
	var sql="SELECT id,nick,phone,address FROM shopuserinfo WHERE uid=?";
	pool.query(sql,[id],(err,result)=>{
		if(err)throw err;
		if(result.length==0){
			res.send({code:-1,message:"查询失败"})
		}else{
			res.send({code:1,message:result})
		}
	})
})

router.get("/logout2",(req,res)=>{
	delete req.session.uid;
	res.send({code:1,message:result})
})


module.exports = router;