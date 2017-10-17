/**
 * use clmtrackr face detector to guess image orientation 
 * 通过 clmtrackr 人脸检测功能来实现对存在人头的图片方向的检测.（旋转N度即可得到正确角度的照片，图片太小，颜色太白，人像五官太模糊，存在脸型图像等都可能导致检测失败或有误）
 *
 * Copyright (c) 2017, AsionTang
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * 通过人脸检测的方式获取图片的方向。
 * @param {String} imgUrl 图片网址
 * @param {Function} callback  0:方向不变（检测不到人脸时，返回-1)，90：需要旋转90度，180,270
 */
function getImageOrientationByFacefaceDetectionFromUrl(imgUrl, callback) {
	var img = new Image();
	img.onload = function() { //FIXME:加载图片是耗时的,尝试改造为在onload里多次尝试正确的角度.
		getImageOrientationByFacefaceDetectionFromImage(img, callback);
	};
	img.src = imgUrl;
}

/**
 * 通过人脸检测的方式获取图片的方向。
 * @param {Image} img Image对象
 * @param {Function} callback  0:方向不变（检测不到人脸时，返回-1)，90：需要旋转90度，180,270
 */
function getImageOrientationByFacefaceDetectionFromImage(img, callback) {
	var currentDegrees = 0;

	function doit(isRight) {
		if(isRight)
			callback(currentDegrees);
		else {
			currentDegrees += 90;
			if(currentDegrees >= 360)
				callback(-1);
			else
				getImageOrientation(img, currentDegrees, doit);
		}
	};
	getImageOrientation(img, currentDegrees, doit);

	function getImageOrientation(img, currentDegrees, callbackIsRight) {
		console.log('getImageOrientation:' + currentDegrees);
		var ctrack = new clm.tracker({
			stopOnConvergence: true
		});
		ctrack.init();
		ctrack.event_clmtrackrNotFound = function(event) {
			stop();
			console.log('event_clmtrackrNotFound');
			callbackIsRight(false);
		};
		ctrack.event_clmtrackrIteration = function(event) {
			stop();
			console.log('event_clmtrackrIteration');
			callbackIsRight(true);
		};
		document.addEventListener("clmtrackrNotFound", ctrack.event_clmtrackrNotFound, false);
		document.addEventListener("clmtrackrIteration", ctrack.event_clmtrackrIteration, false);

		function stop() {
			ctrack.stop();
			document.removeEventListener("clmtrackrNotFound", ctrack.event_clmtrackrNotFound);
			document.removeEventListener("clmtrackrIteration", ctrack.event_clmtrackrIteration);
		}
		//图片加载完成后可以自动开始检测.
		ctrack.start(getCanvasFromImg(img, currentDegrees));

		function getCanvasFromImg(img, degrees) {
			switch(degrees) {
				case 0:
				default:
					{
						var c = document.createElement('canvas');
						c.width = img.width;
						c.height = img.height;
						var ctx = c.getContext("2d");

						ctx.drawImage(img, 0, 0);
					}
					break;
				case 90:
					{
						var c = document.createElement('canvas');
						c.width = img.height;
						c.height = img.width;
						var ctx = c.getContext("2d");

						ctx.translate(img.height, 0); //必须重新设置0,0起点坐标才能正确绘制旋转后的图像
						ctx.rotate(90 * Math.PI / 180); //degrees*Math.PI/180

						ctx.drawImage(img, 0, 0);
					}
					break;
				case 180:
					{
						var c = document.createElement('canvas');
						c.width = img.width;
						c.height = img.height;
						var ctx = c.getContext("2d");

						ctx.translate(img.width, img.height); //必须重新设置0,0起点坐标才能正确绘制旋转后的图像
						ctx.rotate(180 * Math.PI / 180); //degrees*Math.PI/180

						ctx.drawImage(img, 0, 0);
					}
					break;
				case 270:
					{
						var c = document.createElement('canvas');
						c.width = img.height;
						c.height = img.width;
						var ctx = c.getContext("2d");

						ctx.translate(0, img.width); //必须重新设置0,0起点坐标才能正确绘制旋转后的图像
						ctx.rotate(270 * Math.PI / 180); //degrees*Math.PI/180

						ctx.drawImage(img, 0, 0);
					}
					break;
			}
			return c;
		}
	}
}