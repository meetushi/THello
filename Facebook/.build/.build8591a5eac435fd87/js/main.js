//Initialize function
var user_code;
var code;
var accesstoken;
var names = {};
var Id={};
var i;
var img_url={};
var school={};
var id={};
var languages={};
var pfpic;
var result={};

var init = function () {
    // TODO:: Do your initialization job
    console.log("init() called");
   
    // add eventListener for tizenhwkey
    document.addEventListener( 'tizenhwkey', function(e) {
		if (e.keyName === 'back') {
			if ($.mobile.activePage.attr('id') === 'homepage') 
			{
				tizen.application.getCurrentApplication().exit();
			} 
			else if($.mobile.activePage.attr('id') === 'menupage'){
				console.log("----");
				  e.preventDefault();
		           e.stopImmediatePropagation();
				$.mobile.changePage("#homepage");
			}
			else {
				history.back()
				$("#home_id").empty();
				getHomepage();
			}
		}
	});

};
$(document).bind('pageinit', init);


function FBLogin(){
	console.log("inside login");
	currentApp = "FaceBook";
	window.authWin= window.open("https://www.facebook.com/dialog/oauth?client_id=768931936505352&redirect_uri=http://thello.parseapp.com/&scope=read_stream,manage_notifications,read_mailbox,read_requests,user_photos,user_hometown,photo_upload,user_location") ;
	montiorURL() ;

}
function montiorURL()
{
	window.int = self.setInterval(function () {
		window.authCount = window.authCount + 1;
		if (window.authWin && window.authWin.location) {
			var currentURL = window.authWin.location.href;
			var inCallback = currentURL.indexOf("?code");
			if (inCallback >= 0) {
				var codeData = currentURL.substr(currentURL.indexOf("="));
				code=codeData.substring(1);
				getAccesstoken();
			}
		}
		if (window.authCount > 60) {
			alert('30 seconds time out');
			window.authCount  =0;
			window.clearInterval(int)
			window.authWin.close();
		}
	}, 40);
}
function  getAccesstoken(){
	$.ajax({
		type : "GET",
		url :'https://graph.facebook.com/oauth/access_token?client_id=768931936505352&redirect_uri=http://thello.parseapp.com/&client_secret=d0eb8d39e4d32d2f964710ffc1110b0a&code='+code,
		success : function(data) {
			try {
				accesstoken=data;
				access_token=parseToken(accesstoken);
				localStorage['accesstoken']=access_token;
				window.clearInterval(int)
				window.authWin.close();
				$.mobile.changePage("#menupage");
				$("#home_id").empty();
				getHomepage();
			}
			catch (e) {
				console.log(e);
			}
		},
		error : function() {
			$.mobile.changePage("#Loginpage");
			console.log("acess token error");
		}
	});	
}
function getHomepage(){
	var currentRunning = $("#foo").progress("option", "running");
	$("#foo").progress("running", true);
	$.ajax({
		type : "GET",
		url :'https://graph.facebook.com/me/home?access_token=' +localStorage['accesstoken'],
		success : function(data1) {
			$("#home_id").empty();
			var from_id={};
			var from_name={};
			var messages={};
			var type={};
			var picture={};
			var link={};
			var image={};
			var story={};
			var Vname={};
			var Vdescription={};
			var home_length=data1.data.length;
			console.log("length is "+home_length);
			for(i=0;i<home_length;i++){
				from_id[i]=data1.data[i].from.id;
				from_name[i]=data1.data[i].from.name;
				type[i]=data1.data[i].type;
				story[i]=data1.data[i].story;
				messages[i]=data1.data[i].message;
				image[i]="http://graph.facebook.com/"+from_id[i]+"/picture";
				if((type[i]=="link")||(type[i]=="video")||(type[i]=="swf")){
					link[i]=data1.data[i].link;
					Vname[i]=data1.data[i].name;
					Vdescription[i]=data1.data[i].description;
					}
				else if(type[i]=="photo"){
					picture[i]=data1.data[i].picture;
				}
				else{}
			}
			var string='<ul data-role="listview">';
			
			for(i=0;i<home_length;i++){
				string+='<li>'
					  +'<table>'
					  +'<tr>'
	   				  +'<td width="50"><img src="'+image[i]+'"style="width:40px;height:40px;"></td>'
	   				  +'<td>';
				      if(story[i]==undefined)
				    	  string+=from_name[i];
				      else
				    	  string+=story[i];
	   			string+='</td>'
	   			      +'<tr><td></td>'
	   			      +'<td>';
	   			      
	   			if(messages[i]!==undefined)
	   				string+='<font size="3" style="font-weight:lighter;">'+messages[i]+'</br>';
	   			if((type[i]=="link")||(type[i]=="video")||(type[i]=="swf"))
	   			{
	   				if((Vname[i]!=undefined)&&(Vdescription[i]!=undefined)&&(link[i]!=undefined)){
	   				string+='<font size="4" style="font-weight:bold;">'+Vname[i]+'</font></br>'
	   				      +'<font size="3" style="font-weight:lighter;">'+Vdescription[i]+'</font></br>'
	   					  +'<a onclick="openurl(\'' + link[i]+ '\')"><font size="3" style="font-weight:lighter;">'+link[i]+'</font></a>';
	   				}
	   			}
	   			else if(type[i]=="photo")
	   			{
	   				string+='<font size="3" style="font-weight:lighter;"><img src="'+picture[i]+'"></font>';
	   			}
	   			else{}
	   			string+='</td></tr></table>'
	   				  +'</li>';
			}     
			$("#foo").empty();
			$("#home_id").append(string).trigger("create").listview();
		},
		error : function() {
	        $.mobile.changePage("#Loginpage");
			console.log("acess token error");
		}
	});
}
function openurl(link){
	console.log("inside open url");
	var tmp=window.open(link);
	 document.addEventListener( 'tizenhwkey', function(e) {
			if (e.keyName =='back') {
				console.log("---");
				tmp.close();
			}
	 });
}
function parseToken(accesstoken){
	var c = accesstoken.indexOf('access_token') ; 
	var L = accesstoken.indexOf('&expires') ;
	var y = accesstoken.substring(0, c) + accesstoken.substring(L, accesstoken.length);
	var remaining = accesstoken.replace(y,'');
	return (remaining.substring(13));
}
function friendRequests(){
	var currentRunning = $("#foo").progress("option", "running");
	$("#foo").progress("running", true);
	$.ajax({
		type : "GET",
		url :'https://graph.facebook.com/me/friendrequests?access_token=' +localStorage['accesstoken'],
		success : function(data1) {
			$("#home_id").empty();
			var friendnames={};
			var friendid={};
			var image={};
			var flength=data1.data.length;
			for(i=0;i<flength;i++){
				friendnames[i]=data1.data[i].from.name;
				friendid[i]=data1.data[i].from.id;
				image[i]="http://graph.facebook.com/"+friendid[i]+"/picture";
			}
			var string='<center><h4>Friend Requests</h4><center>';
			   if(flength==0){
				   string+='<center>No requests</center>';  
			   }
			   else{
				   		string+='<ul data-role="listview">';
				   		for(i=0;i<flength;i++){
				   			string+='<li>'
				   				+'<img src="'+image[i]+'"class="ui-li-bigicon" ">'
				   				+friendnames[i]
				   				+'</li>';
				   		}
				   		string+='</ul>'
			   }
			   $("#foo").empty();
			   $("#home_id").append(string).trigger("create").listview();
		},
		error:function(){
			console.log("error");
		}
	});
}
function getFriends(){
	$.ajax({
		type : "GET",
		dataType : 'json',
		url : 'https://graph.facebook.com/me/friends?access_token=' +localStorage['accesstoken'],
		success : function(data1) {
			console.log("inside friends")
			$("#friends_id").empty();
			var jsonlength=data1.data.length;
			for(i=0;i<jsonlength;i++)
			{
				names[i]=data1.data[i].name;
				Id[i]=data1.data[i].id;
				img_url[i]="http://graph.facebook.com/"+Id[i]+"/picture";
			}
			var list='<ul id="iList" data-role="listview">'
				for(i=0;i<jsonlength;i++)
				{
					list+='<li>'
						+'<img src="'+img_url[i]+'" style="width:50px;height:50px;">'
						+'&nbsp;&nbsp;'
						+names[i]
					+'</li>';
				}
			$("#friends_id").append(list).trigger("create").listview();
		},
		error : function() {
			console.log("Unable to get your friends on Facebook");
		}
	});
}
function messages()
{
	var currentRunning = $("#foo").progress("option", "running");
	$("#foo").progress("running", true);
	console.log("inside messages");
	$.ajax({
		type : "GET",
		url :'https://graph.facebook.com/me/inbox?access_token=' +localStorage['accesstoken'],
		success : function(data1) {
			console.log("messages success");
			$("#home_id").empty();
			var from={};
			var from_id={};
			var messages={};
			var commentslength={};
			var image={};
			var messageslength=data1.data.length;
			for(i=0;i<messageslength;i++){
				if( data1.data[i].comments != null){
					from[i]=data1.data[i].comments.data[0].from.name;
					console.log(from[i]);
					from_id[i]=data1.data[i].comments.data[0].from.id;
					console.log(from_id[i]);	
					messages[i]=data1.data[i].comments.data[0].message;
				}
				else
					console.log("found comments data null"+ i);
			    
			    console.log(messages[i]);
				image[i]="http://graph.facebook.com/"+from_id[i]+"/picture";
			}
			var string='<center><h4>Messages</h4><center>';
			   if(messageslength==0){
				   string+='<center>No Messages</center>';  
			   }
			   else{
				        console.log("inside else");
				   		string+='<ul data-role="listview">';
				   		for(i=0;i<messageslength;i++){
				   			if((messages[i]!=undefined)||(from[i]!=undefined)||(from_id[i]!=undefined)){
				   			string+='<li>'
				   				+'<img src="'+image[i]+'"class="ui-li-bigicon" ">'
				   				+from[i]+'</br>'
				   			    +'<font size="3" style="font-weight:lighter;">'+messages[i]+'</font>'
				   				+'</li>';
				   			}
				   		}
				   		string+='</ul>'
			   }
			   $("#foo").empty();
			   $("#home_id").append(string).trigger("create").listview();
		},
		error:function(){
		console.log("error");
	}
});
}
function updateStatus(){
	$("#statuspage_id").empty();
	console.log("inside updatestatus");
	$.mobile.changePage("#statuspage");
	var pfimage='<img src="https://graph.facebook.com/me/picture?access_token='+localStorage['accesstoken']+'" style="width:40px;height:60px;"';
	var string='<table>'
		+'<tr><td  width="50" id="col_id">'+pfimage+'</td>'
		+'<td rowspan="3"><textarea placeholder="What`s on your mind" id="status_id" rows="7" cols="40"></textarea></td>'
		+'</tr>'
		+'</table>';
	$("#statuspage_id").append(string);
}
function postStatus(){
	var message=document.getElementById('status_id');
	console.log(message.value);
	 $.ajax( {                                    
	        url : "https://graph.facebook.com/me/feed",
	        type : "POST",
	        crossDomain: true,
	        data: { access_token:localStorage['accesstoken'] , message: message.value},
	        cache : false,
	        success : function(res) {
	            if (!res || res.error) {
	               console.log("Couldn't Publish Data");
	            } else {
	               console.log("Message successfully posted to your wall");
	               $.mobile.changePage("#menupage");	
	               $("#home_id").empty();
				   getHomepage();
	            }
	        },
	        error : function(xhr, textStatus, errorThrown) {
	            alert(xhr.responseText);
	        }
	    });
}
function getProfileiInfo(){
	$.ajax({
		type : "GET",
		dataType : 'json',
		url : 'https://graph.facebook.com/me?fields=first_name,last_name,education,cover,gender,location,languages,hometown,religion,picture&access_token=' +localStorage['accesstoken'] ,
		success : function(data1) {
			console.log("inside profile info");
			$("#profile_id").empty();
			$("#Education").empty();
			var educationlength=data1.education.length;
			var school_image={};
			for(i=0;i<educationlength;i++){
				school[i]=data1.education[i].school.name;
				id[i]=data1.education[i].school.id;
				school_image[i]="http://graph.facebook.com/"+id[i]+"/picture";
			}
			var firstname=data1.first_name;
			var lastname=data1.last_name;
			var gender=data1.gender;
			var hometown=data1.hometown.name;
			var hometown_id=data1.hometown.id;
			var hometown_url="http://graph.facebook.com/"+hometown_id+"/picture";
			var religion=data1.religion;
			var location1=data1.location.name;
			var location_id=data1.location.id;
			var location_url="http://graph.facebook.com/"+location_id+"/picture";
			var cover=data1.cover.source;
			pfpic=data1.picture.data.url;
			var info='<img src="'+cover+'"style="width:100%;height:90%;">'
			+'<img src="'+pfpic+'"id="pf_id" style="width:80px;height:80px;">'
			+'<div id="div_id">'
			+firstname+' '
			+lastname;
			$("#profile_id").append(info);
			var educationinfo='<h4 style="font-size:20px;">Education</h4>'
				+'<ul id="iList" data-role="listview">';
			for(i=0;i<educationlength;i++)
			{
				educationinfo+='<li style="font-size:15px;">'
					+'<img src="'+school_image[i]+'" style="width:40px;height:40px;">'
					+'&nbsp;&nbsp;'
					+school[i]
					+'</li>';
			}
			educationinfo+='</ul>'
				+'<h4 style="font-size:20px;">Living</h4>'
				+'<ul id="iList" data-role="listview">'
				+'<li style="font-size:15px;">'
				+'<img src="'+location_url+'" style="width:40px;height:40px;">'
				+'&nbsp;&nbsp;'
				+location1
				+'</li>'
				+'<li style="font-size:15px;">'
				+'<img src="'+hometown_url+'" style="width:40px;height:40px;">'
				+'&nbsp;&nbsp;'
				+hometown
				+'</li></ul>'
				+'<h4 style="font-size:20px;">Basic Information</h4>'
				+'<ul id="iList" data-role="listview">'
				+'<li style="font-size:15px;">'
				+'<b>Gender</b>'
				+'&nbsp;&nbsp;&nbsp;&nbsp;'
				+gender
				+'</li>'
				+'<li style="font-size:15px;">'
				+'<b>Religious Views</b>'
				+'&nbsp;&nbsp;'
				+religion;
				+'</li>'
				+'</ul>';
				$("#Education").append(educationinfo).trigger("create").listview();									
		},
		error : function() {
			console.log("Unable to get your friends on Facebook");
		}
	});
}
function notifications()
{
	var currentRunning = $("#foo").progress("option", "running");
	$("#foo").progress("running", true);
	console.log("inside notifications");
	$.ajax({
		type : "GET",
		url :'https://graph.facebook.com/me/notifications?access_token=' +localStorage['accesstoken'],
		success : function(data1) {
			$("#home_id").empty();
			var notificationslength=data1.data.length;
			var from_name={};
			var fromid={};
			var title={};
			var image={};
			for(i=0;i<notificationslength;i++){
				from_name[i]=data1.data[i].from.name;
				fromid[i]=data1.data[i].from.id;
				title[i]=data1.data[i].title;
				image[i]="http://graph.facebook.com/"+fromid[i]+"/picture";
			}
			var string='<center><h4>Notifications</h4><center>';
			   if(notificationslength==0){
				   string+='<center>No new notifications</center>';  
			   }
			   else{
				   		string+='<ul data-role="listview">';
				   		for(i=0;i<notificationslength;i++){
				   			string+='<li>'
				   				+'<img src="'+image[i]+'"class="ui-li-bigicon" ">'
				   				+title[i];
				   				+'</li>';
				   		}
				   		string+='</ul>'
			   }
			   $("#foo").empty();
			   $("#home_id").append(string).trigger("create").listview();
		},
	error:function(){
		console.log("error");
	}
	});
}
function getAlbums(){
	$('#upcoming_page_settings_menu').popup('close');
	console.log("inside albums");
	var selectedAlbum;
	var albumslength;
	var count=0;
	var album_name={};
	var picture_link={};
	var album_cover_photo={};
	var album_cover_photo_link={};
	var photoslength;
	$.ajax({
		type : "GET",
		url :'https://graph.facebook.com/me?fields=albums.fields(id,name,cover_photo,photos.fields(name,picture,source))&access_token=' +localStorage['accesstoken'] ,
		success : function(data1) {
			$("#home_id").empty();
			albumslength=data1.albums.data.length;
			for(i=0;i<albumslength;i++){
				if(data1.albums.data[i].hasOwnProperty('photos')){
					if(data1.albums.data[i].name){
						photoslength=data1.albums.data[i].photos.data.length;
						console.log(photoslength);
						album_name[i]=data1.albums.data[i].name;
						album_cover_photo[i]=data1.albums.data[i].cover_photo;
						for(j=0;j<photoslength;j++){
							picture_link[j]=data1.albums.data[i].photos.data[j].picture;
							if(data1.albums.data[i].photos.data[j].id==album_cover_photo[i]){
								album_cover_photo_link[i]=data1.albums.data[i].photos.data[j].picture;
							}
						}
						count++;
					}
				}
			}
			var string='<center><h4>Albums</h4><center>';
			if(albumslength==0){
				string+='<center>No new albums</center>';  
			}
			else{
				string+='<div id="albumList" class="container">';
				for(var i = 0; i < count; i++) {
					string+='<div class="box" data-id='+i+'>'
					+'<a href="#photosPage">';
					if(album_cover_photo_link[i])
						string+='<img src="'+album_cover_photo_link[i]+'" class="category_icon"/>';
					else string+='<img src="./Facebook_icon.png" class="category_icon"/>';
					string+='<center><figcaption class="caption">'+album_name[i]+'</figcaption></center></a></div>';
				}
				string+='</div>';
			}
			$("#home_id").append(string).trigger("create").listview();
			$(document).on("click","div#albumList > div", function(){
				$("#photos_list").empty();
				var projIndex=$(this).attr("data-id");
				selectedAlbum=$(this).text();
				var string='<center><h3>'+selectedAlbum+'</h3><center>';
				string+='<div class="container">';
				for(i=0;i<data1.albums.data[projIndex].photos.data.length;i++){
					console.log(data1.albums.data[projIndex].photos.data[i].picture);
					string+='<div class="box" data-id='+i+'>'
					string+='<img src="'+data1.albums.data[projIndex].photos.data[i].picture+'" class="category_icon"/></div>';
				}
				string+='</div>';
				$("#photos_list").append(string).trigger("create").listview()
			});
		},
		error:function(){
			console.log("error");
		}
	});
}
function Logout()
{
	$.ajax({
		type : "GET",
		//dataType : 'json',
		url :'https://www.facebook.com/logout.php?next=https://www.facebook.com/connect/login_success.html&access_token='+localStorage['accesstoken'],
		success : function(data) {
			tizen.application.getCurrentApplication().exit();	
		},
	error: function(){console.log("error");}
	});
}