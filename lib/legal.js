var docname = window.location.pathname.split('/').reverse(),
	titleText = 'OSS Notice | ' + docname[1].split('-').shift('') + ' for ' + docname[1].split('-').pop(''),
	noticeText = '<p>This application is Copyright © 2015 kakao corp. All Rights Reserved. </p><p>This application use Open Source Software (OSS). You can find the source code of these open source projects, along with applicable license information, below. We are deeply grateful to these developers for their work and contributions.</p><p>Any questions about our use of licensed work can be sent to <a href="mailto:oss@kakaocorp.com">oss@kakaocorp.com</a><p>';
$(function() {
	$('title, #title').text(titleText);
	$('#notice').html(noticeText);
	$('#title').append(' <input id="createHtml" type="button" onclick="downloadDocument();" value="Create .html">');
});
function downloadDocument() {
	$('#title input').remove();
	$.get('../lib/legal.css', function(data) {
		var headers = '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no"/><title>' + titleText +'</title><style>' + data.replace(/\n/g, '') + '</style></head>',
		bodys = '<body>' + $('body').html().replace(/\n/g, '') + '</body></html>',
		base64doc = btoa(unescape(encodeURIComponent(headers + bodys))),
		a = document.createElement('a'),
		e = document.createEvent("HTMLEvents");
	a.download = 'oss_notice.html'; a.href = 'data:text/html;base64,' + base64doc; e.initEvent('click'); a.dispatchEvent(e);
	});
};
Papa.parse('data.csv', {
	download: true,
	header: true,
	skipEmptyLines: true,
	complete: function(results) {
		var items = [],
			arr = [];
		$.each(results.data, function(key, val) {
			items.push('<dt>' + val.oss + '</dt>');
			if (!$.isEmptyObject(val.component)) { items.push('<dd><i>' + val.component.replace(/\n/g, "<br/>") + '</i></dd>');};
			items.push('<dd><a href="' + val.url + '">' + val.url + '</a></dd>');
			if (!$.isEmptyObject(val.copyright)) {
				items.push('<dd>Copyright  &copy; ' + val.copyright.replace(/\n/g, "<br/>Copyright  &copy; ")  + '</dd>')
			};
			if ((val.license.match(/\n/g)||[]).length == 0) {
				if (val.license != 'Public Domain') {
					items.push('<dd class="license"><a href="#' + encodeURI(val.license) + '">' + val.license + '</a></dd>');
					if ($.inArray(val.license, arr) == -1) { arr.push(val.license); };
				} else {items.push('<dd class="license">' + val.license + '</dd>');};
			} else if ((val.license.match(/\n/g)||[]).length > 0) {
				var sepLicense = val.license.split('\n'),
					licenseclass = '<dd class="license">';
				$.each(sepLicense, function(i) {
					licenseclass = licenseclass + '<a href="#' + encodeURI(sepLicense[i]) + '">' + sepLicense[i] + '</a>';
					if (Object.keys(sepLicense).length-1 > i ) { licenseclass = licenseclass + ' , '; }
					if ($.inArray(sepLicense[i], arr) == -1) { arr.push(sepLicense[i]); }
				});
				licenseclass = licenseclass + '</dd>';
				items.push(licenseclass);
			};
		});
		$.getJSON('../lib/licensemap.json', function(lmap) {
			$.each(arr, function(i, val) {
				if(!$.isEmptyObject(lmap[val])) {
					$.get("../license/" + encodeURI(lmap[val]) + ".txt", function( data ) {
						var addh1 = "# " + val + "\n\n" + data;
						$("<div id='"+val+"' />").appendTo("#licenses").html(mmd(addh1));
					})
				} else if (!$.isEmptyObject(val)) {
					$.get("../license/" + encodeURI(val) + ".txt", function( data ) {
						var addh1 = "# " + val + "\n\n" + data;
						$("<div id='"+val+"' />").appendTo("#licenses").html(mmd(addh1));
					})
				}
				console.log(val, ":",  lmap[val]);
			})
		});
		$('<dl />', {
			html: items
		}).appendTo($('#oss'));
	}
});
