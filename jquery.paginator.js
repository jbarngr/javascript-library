/*
		FILE
			jquery.paginator.js
		AUTHOR
			Jeremy Barngrover
		VERSION
			0.8
		VERSION DATE
			2011-08-09
		SETUP
			$(<container>).paginator();
		OPTIONS 
			pageSelector	: 	'.page',	// Selector used to identify pages (i.e. class, emlement)
			pageAttr		:	'rel',	// Element attribute to use for page to load
			currentPage 	:	1,		// Current Page
			goToPage		:	1,		// Page that we need to go to
			currentPageClass	:	'currentPage',	// Class to be given the curent page link
			showPrev		:	true,	// turn on/off Previous button. Possible Values false, true, 'Auto' (turns Prev off on when current_page = 1)
			showNext		:	true,	// turn on/off Next button. Possible Values false, true, 'Auto' (turns Next off on when current_page = last page)
			prevMarker	    :	'prevPage',	// Class/ID to add to Previous Button
			nextMarker	    :	'nextPage',	// Class/ID to add to Next Button
			prevText		:	'Prev',	// Optional text to add to the Previous button
			nextText		:	'Next',	// Optional text to add to the Next button
			inactivePrev	:	'inactivePrev', // Optional class to add to Previous button to make it "inactive"
			inactiveNext	:	'inactiveNext', // Optional class to add to Next button to make it "inactive"
			addMorePageSpacer	: true,	// Add a spacer between numbers and the Next/Prev buttons
			morePageSpacer	:	'&#8230;',	// What to fill the space with (Default: ellipsis {...})
			numberStickyPages	:	0,		// Number of page links that will always be shown adjacent to Next/Prev buttons (spacer will follow as required)
			numberPageShow	:	7,		// Number of page links to display (excludes sticky pages when applicable
			pageLinkClass	:	'pgLink',	// Class to add to the li containing the page link.
			linkUlClass	    :	'ulLink',	// Class to add to the UL of the pagination
			syncPageSwitch  :	false,	// Syncronize page switching
			transOut		:	'fadeOut',	//Method of transition for transOut(fadeOut, slideUp, animate)
			transIn	        :	'fadeIn',		//Method of transition for transIn(fadeIn, slideDown, animate)
			transOutOpts	:	{ 	duration	:	600,
								easing	:	'',
								properties	:	'' // Only used with animate
							},		// Transition Out Options
			transInOpts	:	{	duration	: 600,
								easing	:	'',
								properties	: '' //Only used with animate
							},		// Transition In Options			
		CALLBACK METHODS
			onPageChange	:	function(){return false;},	// Callback for page changes
			onPrev		:	function(){return false;},	// Callback for when Prev button is selected
			onNext		:	function(){return false;},	// Callback for when Next button is selected
			onPageOut		:	function(){return false;},	// Callback for when FadeOut Starts
			onPageIn		:	function(){return false;},	// Callback for when FadeIn Starts
			onReady		: 	function(){return false;},	// Callback for when Pagination is in Ready State
			onInit		:	function(){return false;}	// Callback for when paginator is initialized
*/
(function($){	
	$.fn.paginator = function(opts){
		var transition = function(opts, container){
			var pageSwitch = false;
			var postSwitch = "container.scrollTop; $('.' + opts.linkUlClass).html('').append(buildPagLinks(opts, container)); addClickEvent(opts, container); opts.currentPage = opts.goToPage;";
			var	$inCallback = "function(){ if(typeof opts.onPageIn == 'function') opts.onPageIn.call(this); " + postSwitch +" }";
			
			if(opts.transIn == 'fadeIn' || opts.transIn == 'slideDown' ){
				var $in = "$('" + opts.pageSelector + "[" + opts.pageAttr + "=" + opts.goToPage + "]').";
					$in += opts.transIn + "(" + opts.transInOpts.duration + ", '" + (opts.transInOpts.easing === undefined ? "" :  opts.transInOpts.easing);
					$in += "', " + $inCallback + ");";
			}else if(opts.transIn == 'animate' && (opts.transInOpts.properties !== undefined || opts.transInOpts.properties.length > 0)){
				var props = (typeof opts.transInOpts.properties) ? objectToString(opts.transInOpts.properties) : opts.transInOpts.properties;
				var $in = "$('" + opts.pageSelector + "[" + opts.pageAttr + "=" + opts.goToPage + "]')." + opts.transIn;
					$in += "('" + props + "', " + opts.transInOpts.duration + ", '" + (opts.transInOpts.easing === undefined ? "" :  opts.transInOpts.easing);
					$in += "'," + $inCallback + ");";
			}else{
				var $in = "$('" + opts.pageSelector + "[" + opts.pageAttr + "=" + opts.goToPage + "]').css('display','block');" + $inCallback;
				pageSwitch = true;
			}
			
			if(opts.syncPageSwitch)
				var outCallback = "function(){ $('" + opts.pageSelector + "[" + opts.pageAttr + "=" + opts.currentPage + "]').css('display','none');" + (opts.syncPageSwitch ? $in : '') + "if(typeof opts.onPageOut == 'function') opts.onPageOut.call(this); return false;}";
			if(opts.transOut == 'fadeOut' || opts.transOut == 'slideUp'){
				var out = "$('" + opts.pageSelector + "[" + opts.pageAttr + "=" + opts.currentPage + "]').";
					out += opts.transOut + "(" + opts.transOutOpts.duration + ", '" + (opts.transOutOpts.easing === undefined ? "" :  opts.transOutOpts.easing);
					out += "', " + outCallback + ");";
			}else if(opts.transOut == 'animate' && (opts.transOutOpts.properties !== undefined || opts.transOutOpts.properties.length > 0)){
				var props = objectToString(opts.transOutOpts.properties);
				var out = "$('" + opts.pageSelector + "[" + opts.pageAttr + "=" + opts.currentPage + "]')." + opts.transOut;
					out += "(" + props + ", " + opts.transOutOpts.duration + ", '" + (opts.transOutOpts.easing === undefined ? "" :  opts.transOutOpts.easing);
					out += "', " + outCallback + ");";
			}else{
				var out = "$('" + opts.pageSelector + "[" + opts.pageAttr + "=" + opts.currentPage + "]').css('display','none');" + outCallback;
				pageSwitch = true;
			}
			
			eval(out);
			if(!opts.syncPageSwitch || pageSwitch)
				eval($in);
				
			if(typeof opts.onPageChange == 'function')
				opts.onPageChange.call(this);
				
		}, buildPagination = function(container, opts){
			var hold = '<ul class="' + opts.linkUlClass + '">';
			
			hold += buildPagLinks(opts, container);
			
			hold += '</ul>'
			$(container.selector).append(hold);
			
		}, numberPages = function(){
			var i = 1;
			$(container.selector + ' ' + opts.pageSelector).each(function(){
				$(this).attr(opts.pageAttr, i).css('display','none');
				i++;
			});
			$(container.selector + ' ' + opts.pageSelector + ':first').css('display','block');
			return i - 1;
		}, buildPagLinks = function(opts, container){
		
			var pc = $(container.selector + ' ' + opts.pageSelector).length;
			var y = {
					i : 1,
					z : (opts.numberPageShow > 0 && opts.numberPageShow >= pc)? opts.numberPageShow : pc,
					needEllPrev : false,
					stickyPrev  : false,
					needEllNext : false,
					stickyNext  : false
				};
			
			// If page going to is greater than the number of pages shown and less than or equal to total page show the last few
			if(opts.goToPage > pc - (opts.numberPageShow) && pc > opts.numberPageShow){
				y.i = pc - opts.numberPageShow +1;
				y.z = pc;			

			}else if(	opts.goToPage < pc - (opts.numberPageShow + opts.numberStickyPages) && 
						opts.goToPage > (opts.numberStickyPages + opts.numberPageShow) &&
						opts.numberPageShow < pc
					){
				
				y.i = opts.goToPage - parseInt(opts.numberPageShow / 2);
				y.z = opts.goToPage + parseInt(opts.numberPageShow / 2);
			}
			
			y.needEllPrev = true;
			y.stickyPrev = (opts.numberPageShow - opts.numberStickyPages > 0 && opts.numberStickyPages != 0) ? true : false;
			y.needEllPrev = y.stickyPrev ? y.needEllPrev : false;
			y.needEllNext = true;
			y.stickyNext = (opts.goToPage + opts.numberStickyPages + opts.numberPageShow < pc && opts.numberStickyPages != 0) ? true : false;
			y.needEllNext = y.stickyNext ? y.needEllNext : false;
			
			var hold2 = '';
			
			// Add the Previous button if needed
			if(opts.showPrev === true || (opts.showPrev == 'Auto' && opts.goToPage != 1)){
				hold2 += '<li class="' + opts.pageLinkClass + '">'
				hold2 += '<a class="' + opts.prevMarker + ((opts.inactivePrev != '' &&  opts.goToPage == 1) ? ' ' + opts.inactivePrev : '');
				hold2 += '" href="javascript:void(0);" rel="' + (opts.goToPage == 1 ? 1 : opts.goToPage - 1) + '">' + opts.prevText + '</a></li>';
			}
			
			if(opts.addMorePageSpacer && y.needEllPrev){
			    
			    if(y.stickyPrev){
			        for(i=1; i <= opts.numberStickyPages; i++){
			            hold2 += '<li class="' + opts.pageLinkClass + '"><a class="' + opts.prevMarker + '" href="javascript:void(0);" rel="' + i + '">' + i + '</a></li>';
			        }
			    }
			    hold2 += '<li class="' + opts.pageLinkClass + '">' + opts.morePageSpacer + '</li>';
			}
			
			while(y.i <= y.z && y.i <=pc){
				hold2 += '<li class="' + opts.pageLinkClass + '"><a class="' + (y.i == opts.goToPage ? opts.currentPageClass : '') + '" href="javascript:void(0);" rel="' + y.i + '">' + y.i + '</a></li>';
				y.i++;
			}
			
			if(opts.addMorePageSpacer && y.needEllNext){ 
			    hold2 += '<li class="' + opts.pageLinkClass + '">' + opts.morePageSpacer + '</li>';
			    
			    if(y.stickyNext){
			        for(i= (pc - opts.numberStickyPages + 1); i <= pc; i++){
			            hold2 += '<li class="' + opts.pageLinkClass + '"><a class="' + opts.nextMarker + '" href="javascript:void(0);" rel="' + i + '">' + i + '</a></li>';
			        }
			    }
			   
			}
			
			// Add the next button if needed
			if(opts.showNext === true || (opts.showNext == 'Auto' && opts.goToPage != pc)){
				hold2 += '<li class="' + opts.pageLinkClass + '">'
				hold2 += '<a class="' + opts.nextMarker + ((opts.inactiveNext != '' &&  opts.goToPage == 1) ? ' ' + opts.inactiveNext : '');
				hold2 += '" href="javascript:void(0);" rel="' + (opts.goToPage == pc ? pc : opts.goToPage + 1) + '">' + opts.nextText + '</a></li>';
			}
			return hold2;
		}, addClickEvent = function(opts, container){
			$('.' + opts.prevMarker).click(function(e){
				if(typeof opts.onPrev == 'function')
					opts.onPrev.call(this);
			});
			$('.' + opts.nextMarker).click(function(e){
				if(typeof opts.onNext == 'function')
					opts.onNext.call(this);
			});
			$('.' + opts.linkUlClass + ' .' + opts.pageLinkClass + ' a').click(function(e){
				e.preventDefault();
				opts.goToPage = parseInt($(this).prop('rel'));
				transition(opts, container);
			});
		},	objectToString = function(o){
			var parse = function(_o){
				var a = [], t;
				for(var p in _o){
					if(_o.hasOwnProperty(p)){
						t = _o[p];
						if(t && typeof t == "object"){
							a[a.length]= p + ":{ " + arguments.callee(t).join(", ") + "}";
						}else{
							if(typeof t == "string")
								a[a.length] = [ p+ ": \"" + t.toString() + "\"" ];
							else
								a[a.length] = [ p+ ": " + t.toString()];
						}
					}
				}
				return a;
			}
			return "{" + parse(o).join(", ") + "}";
    		
		};
		
		var defaults = {
			/*		OPTIONS		*/
			pageSelector	: 	'.page',	// Selector used to identify pages (i.e. class, emlement)
			pageAttr		:	'rel',	// Element attribute to use for page to load
			currentPage 	:	1,		// Current Page
			goToPage		:	1,		// Page that we need to go to
			currentPageClass	:	'currentPage',	// Class to be given the curent page link
			showPrev		:	true,	// turn on/off Previous button. Possible Values false, true, 'Auto' (turns Prev off on when current_page = 1)
			showNext		:	true,	// turn on/off Next button. Possible Values false, true, 'Auto' (turns Next off on when current_page = last page)
			prevMarker	    :	'prevPage',	// Class/ID to add to Previous Button
			nextMarker	    :	'nextPage',	// Class/ID to add to Next Button
			prevText		:	'Prev',	// Optional text to add to the Previous button
			nextText		:	'Next',	// Optional text to add to the Next button
			inactivePrev	:	'inactivePrev', // Optional class to add to Previous button to make it "inactive"
			inactiveNext	:	'inactiveNext', // Optional class to add to Next button to make it "inactive"
			addMorePageSpacer	: true,	// Add a spacer between numbers and the Next/Prev buttons
			morePageSpacer	:	'&#8230;',	// What to fill the space with (Default: ellipsis {...})
			numberStickyPages	:	0,		// Number of page links that will always be shown adjacent to Next/Prev buttons (spacer will follow as required)
			numberPageShow	:	7,		// Number of page links to display (excludes sticky pages when applicable
			pageLinkClass	:	'pgLink',	// Class to add to the li containing the page link.
			linkUlClass	    :	'ulLink',	// Class to add to the UL of the pagination
			syncPageSwitch  :	false,	// Syncronize page switching
			transOut		:	'fadeOut',	//Method of transition for transOut(fadeOut, slideUp, animate)
			transIn	        :	'fadeIn',		//Method of transition for transIn(fadeIn, slideDown, animate)
			transOutOpts	:	{ 	duration	:	600,
								easing	:	'',
								properties	:	''
							},		// Transition Out Options
			transInOpts	:	{	duration	: 600,
								easing	:	'',
								properties	: ''
							},		// Transition In Options			
			/*		CALLBACK METHODS	*/
			onPageChange	:	function(){return false;},	// Callback for page changes
			onPrev		:	function(){return false;},	// Callback for when Prev button is selected
			onNext		:	function(){return false;},	// Callback for when Next button is selected
			onPageOut		:	function(){return false;},	// Callback for when FadeOut Starts
			onPageIn		:	function(){return false;},	// Callback for when FadeIn Starts
			onReady		: 	function(){return false;},	// Callback for when Pagination is in Ready State
			onInit		:	function(){return false;}	// Callback for when paginator is initialized
		};
		
		var system = {
			file :	'jquery.paginator.js',
			version :	'0.8',
			author	:	'Jeremy Barngrover',
			date	:	'2011-08-04'
		};
		if(typeof opts.onInit == 'function')
			opts.onInit.call(this);
		
		if($(this).data('pagState') === undefined){
			var opts = $.extend(defaults, opts);
			$(this).data('pagState', opts);
		}else{
			var opts = $.extend($(this).data('pagState'), opts);
		}
		
		var container = this;
		var numPages = numberPages(container, opts);
		if( numPages > 1){
			
			buildPagination(container, opts);
			addClickEvent(opts, container);
			if(typeof opts.onReady == 'function')
				opts.onReady.call(this);
		}
	};
})(jQuery)