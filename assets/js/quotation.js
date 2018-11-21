/*! jquery.cookie v1.4.1 | MIT */
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?a(require("jquery")):a(jQuery)}(function(a){function b(a){return h.raw?a:encodeURIComponent(a)}function c(a){return h.raw?a:decodeURIComponent(a)}function d(a){return b(h.json?JSON.stringify(a):String(a))}function e(a){0===a.indexOf('"')&&(a=a.slice(1,-1).replace(/\\"/g,'"').replace(/\\\\/g,"\\"));try{return a=decodeURIComponent(a.replace(g," ")),h.json?JSON.parse(a):a}catch(b){}}function f(b,c){var d=h.raw?b:e(b);return a.isFunction(c)?c(d):d}var g=/\+/g,h=a.cookie=function(e,g,i){if(void 0!==g&&!a.isFunction(g)){if(i=a.extend({},h.defaults,i),"number"==typeof i.expires){var j=i.expires,k=i.expires=new Date;k.setTime(+k+864e5*j)}return document.cookie=[b(e),"=",d(g),i.expires?"; expires="+i.expires.toUTCString():"",i.path?"; path="+i.path:"",i.domain?"; domain="+i.domain:"",i.secure?"; secure":""].join("")}for(var l=e?void 0:{},m=document.cookie?document.cookie.split("; "):[],n=0,o=m.length;o>n;n++){var p=m[n].split("="),q=c(p.shift()),r=p.join("=");if(e&&e===q){l=f(r,g);break}e||void 0===(r=f(r))||(l[q]=r)}return l};h.defaults={},a.removeCookie=function(b,c){return void 0===a.cookie(b)?!1:(a.cookie(b,"",a.extend({},c,{expires:-1})),!a.cookie(b))}});

var default_page = 'dashboard';
var products = [];
var clients = [];
var quotations = [];
var addurl = 'api/add.php';
var geturl = 'api/get.php';
var base_path = 'http://quoteeasy.esy.es/';
var user_id = $.cookie('user_id') || '';
var is_loggedin = false;
var $select;
var edit_id = '';
var edit_type = '';
var deliery_terms = [];
var tax_terms = [];
var payment_terms = [];
var pf_terms = [];
var freight_terms = [];
var table;
var user_data= ''; 
var invoice_data = [];
var vendor_data = [];
var bill_data = [];
var is_mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
var selected_client = {};
if(window.location.hostname == 'localhost')
	base_path = '';
$(document).ready(function()
{
	getMarkup(default_page);
	$('footer').hide();
	if($.cookie('user_id'))
	{
		$('#login_container').hide();
		$('#main_container').show();
		$('footer').show();
		$('.user-name').html($.cookie('user_name'));
		getProducts();
		getClient();
		getQuotation();
		getUserData();
		getInvoices();
		getVendors();
		getBills();
	}
	$('body').on('change','select[name="client_state"]',function()
	{
		$('select[name="consigne_state"]').val(this.value);
	});
	$('.signout').click(function()
	{
		$.removeCookie('user_id');
		$.removeCookie('user_name');
		window.location = 'logout.php';
		$('#login_container').show();
		$('#main_container').hide();
		$('footer').hide();
	});
	$('#signin').click(function()
	{
		var uname = $('input[name="uname"]').val();
		var pass = $('input[name="pass"]').val();
		if(uname!= '' && pass!= '')
		{
			var obj = {'email':uname,'password':pass};
			ajaxCall('api/login.php','POST',obj,function(data)
			{
				var data = $.parseJSON(data);
				if(data.message == 'Login successful')
				{
					$('#login_container').hide();
					$('#main_container').show();
					$('footer').show();
					$('.user-name').html($.cookie('user_name'));
					$.cookie('user_id',data.id);
					$.cookie('user_name',data.name);
					user_id = data.id;
					getProducts();
					getClient();
					getQuotation();
					/* getDeliveryTerms();
					getFreightTerms();
					getPfTerms();
					getPaymentTerms();
					getTaxTerms(); */
					getUserData();
				}
				else
				{
					alert(data.message);
				}
			});
			
		}
		else
		{
			alert('Username and Password is compulsary');
		}
	});
	$('.navigation li').click(function(e)
	{
		e.stopPropagation();
		$('.navigation li').removeClass('active');
		if($(this).hasClass('active'))
			return;
		clearEditData();
		$('#myModal').fadeOut();
		if($(this).parent().parent().hasClass('has-submenu'))
		{
			$(this).parent().parent().addClass('active');
		}
		else
		{
			$(this).addClass('active');	
		}
		default_page = $(this).attr('data-content');	
		if(default_page)
		{
			getMarkup(default_page); 
			
		}
	});
	
	$('body').on('click','input[name="reset"]',function()
	{
		clearData();
		clearEditData();
	});
	$('body').on('keyup','input[name="quantity"]',function()
	{
		if(this.value == 0)
			this.value = '';
	})
	$('body').on('blur','input[name="discout"],input[name="quantity[]"],input[name="price[]"]',function()
	{
		var price = 0;
		$('input[name="price[]"]').each(function()
		{
			price += parseFloat(this.value);
		});
		var discount = parseFloat($('input[name="discout"]').val()) || 0;
		var quantity = 0;
		$('input[name="quantity[]"]').each(function()
		{
			quantity += parseInt(this.value);
		});
		var final_price = (price * quantity) - ((discount/100)* ( price * quantity));
		$('input[name="final_price"]').val(final_price);
	});
	$('body').on('click','input[name="save"]',function()
	{
		switch(default_page)
		{
			case 'add_product':
				addProduct();
				break;
			case 'add_quotation':
				addQuotation();
				break;
			case 'add_client':
				addClient();
				break;
			case 'company_profile':	
				updateUser();
				break;
			case 'add_invoice':
				addInvoice();
				break;
			case 'add_vendor':
				addVendor();
				break;
			case 'add_bill':
				addBill();
				break;			
				
		}
	});

	$('body').on('click','#add_product',function()
	{
		var length = $('input[name="quantity[]"]').length;
		if(default_page == 'add_quotation')
		{			
			var product_mkup = '<div class="single-product"><div class="form-group"><label class="col-sm-3 control-label">*Product Name</label><div class="col-sm-7"><select name="product[]" class="form-control typeahead" data-index="'+length+'"></select></div></div><div class="form-group"><label class="col-sm-3 control-label">*Product Price</label><div class="col-sm-7"><input type="number" name="price[]" min="1" class="form-control" data-index="'+length+'"/></div></div><div class="form-group"><label class="col-sm-3 control-label">*Product Quantity</label><div class="col-sm-7"><input type="number" class="form-control" name="quantity[]" min="1" placeholder="Product quantity" data-index="'+length+'"/></div></div><div class="form-group"><div class="col-md-12 text-center col-sm-12"><input type="button" class="remove_product btn btn-primary btn-danger" value="Remove Product"/></div></div></div>';
			$('#product_container').append(product_mkup);
			fillDropDowns(length);
		}
		else if(default_page == 'add_invoice')
		{
			var product_mkup = '<div class="single-product"><div class="form-group"><label class="col-sm-1 control-label left">Name<span class="compulsory">*</span></label><div class="col-sm-5"><select name="product[]" class="form-control" data-index="'+length+'"></select></div><label class="col-sm-1 control-label left">Quantity<span class="compulsory">*</span></label><div class="col-sm-5"><input type="number" name="quantity[]" min="1" class="form-control"></div></div><div class="form-group"><label class="col-sm-1 control-label left">Amount<span class="compulsory">*</span></label><div class="col-sm-5"><input type="text" name="price[]" class="form-control"></div><label class="col-sm-1 control-label left">Discount<span class="compulsory">*</span></label><div class="col-sm-5"><input type="number" name="product_discount[]" class="form-control" min="0"></div></div><div class="form-group"><label class="col-sm-1 control-label left">HSN/SAC Code</label><div class="col-sm-5"><input type="text" name="hsn_code[]" class="form-control"></div><label class="col-sm-1 control-label left">UMO</label><div class="col-sm-5"><select name="umo[]" class="form-control"><option value="Nos">Nos</option><option value="Days">Days</option><option value="Sets">Sets</option><option value="Unit">Unit</option></select></div></div><div class="form-group"><label class="col-sm-1 control-label left cgst">CGST</label><div class="col-sm-5 cgst"><select name="cgst[]" class="form-control typeahead"><option value="0">0%</option><option value="2.5">2.5%</option><option value="6">6%</option><option value="9">9%</option><option value="14">14%</option></select></div><label class="col-sm-1 control-label left sgst">SGST</label><div class="col-sm-5 sgst"><select name="sgst[]" class="form-control typeahead"><option value="0">0%</option><option value="2.5">2.5%</option><option value="6">6%</option><option value="9">9%</option><option value="14">14%</option></select></div><label class="col-sm-1 control-label left igst" style="display:none">IGST</label><div class="col-sm-5 igst" style="display:none"><select name="igst[]" class="form-control typeahead"><option value="0">0%</option><option value="2.5">2.5%</option><option value="6">6%</option><option value="9">9%</option><option value="14">14%</option></select></div></div><div class="form-group"><div class="col-md-12 text-center col-sm-12"><input type="button" class="remove_product btn btn-primary btn-danger" value="Remove Product"></div></div>';
			$('#invoice_product_container').append(product_mkup);
			if(user_data.state == selected_client.state)
			{
				$('select[name="freight_igst"],select[name="loading_igst"],select[name="other_igst"],select[name="igst[]"]').val(0);
				$('.igst').hide();
				$('.cgst,.sgst').show();
			}
			else
			{
				$('select[name="loading_cgst"],select[name="loading_sgst"],select[name="freight_cgst"],select[name="freight_sgst"],select[name="other_cgst"],select[name="other_sgst"],select[name="cgst[]"],select[name="sgst[]"]').val(0)
				$('.igst').show();
				$('.cgst,.sgst').hide();
			}	

			fillDropDowns(length);
		}
	});
	$('body').on('click','.remove_product',function()
	{
		$(this).parent().parent().parent().remove();
	});
	$('.close').click(function()
	{
		$('#myModal').fadeOut();
	});
	$('body').on('click','.view',function(e)
	{
		var id = $(this).parent().parent().attr('data-id');
		viewData(id);		
	});
	$('body').on('click','.edit',function(e)
	{
		edit_id = $(this).parent().parent().attr('data-id');
		switch(default_page)
		{
			case 'product_list':
				edit_type = 'product';
				default_page = 'add_product';
				getMarkup(default_page,function()
				{
					
					
				});				
			break;
			case 'client_list':
				edit_type = 'client';
				default_page = 'add_client';
				getMarkup(default_page,function()
				{
					populateData(edit_type);
				});
			break;	
			case 'vendor_list':
				edit_type = 'vendor';
				default_page = 'add_vendor';
				getMarkup(default_page,function()
				{
					populateData(edit_type);
				});
			break;
			case 'bill_list':
				edit_type = 'bill';
				default_page = 'add_bill';
				getMarkup(default_page,function()
				{
					populateData(edit_type);
				});
			break;
			case 'invoice_list':
				edit_type = 'invoice';
				default_page = 'add_invoice';
				getMarkup(default_page,function()
				{
					populateData(edit_type);
				});
			break;
		}
	});		
	$('body').on('click','.download',function(e)
	{
		var id = $(this).parent().parent().attr('data-id');
		var obj = {'id':id,'action':'view'};
		if(default_page == 'invoice_list')
			window.open('api/create_invoice.php?id='+id+'&action=view','_blank');
		else
			window.open('api/create_quote.php?id='+id+'&action=view','_blank');
		
	});
	$('body').on('click','.delete',function(e)
	{
		var id = $(this).parent().parent().attr('data-id');
		var type = '';
		if(confirm('Are you sure you want to delete this entry?'))
		{
			var $this = this;
			var url = 'api/add.php';
			if(default_page == 'product_list')
				type = 'product';
			else if(default_page == 'client_list')
				type = 'client';
			else if(default_page == 'quotation_list')
				type = 'quotation';
			else if(default_page == 'invoice_list')
			{
				type = 'invoice';
				url = 'api/add_invoice.php';
			}
			else if(default_page == 'vendor_list')
			{
				type = 'vendor';
			}
			else if(default_page == 'bill_list')
			{
				url = 'api/add_vender_bill.php';
				type = 'vendor_bill';
			}
			if(type == 'quotation')
			{
				url = 'api/add_quotation.php'
			}
			var obj = {'action':'delete','type':type,'id':id};
			ajaxCall(url,'POST',obj,function(data)
			{
				var data = $.parseJSON(data);
				if(data.success)
				{
					//$($this).parent().parent().remove();
					if(default_page == 'product_list')
						getProducts();
					else if(default_page == 'client_list')
						getClient();
					else if(default_page == 'quotation_list')
						getQuotation();
					else if(default_page == 'invoice_list')
						getInvoices();
					else if(default_page == 'vendor_list')
						getVendors();
					else if(default_page == 'bill_list')
						getBills();
					//alert('Deleted successfully.');
				}
				else
				{
					alert('Failed to delete.');
				}
			});
		}
		else
		{
			
		}
	});
	$('body').on('change','input[name="cgst"],input[name="sgst"],input[name="igst"],input[name="basic_price"],input[name="other_price"]',function()
	{
		var amt = getTotalAmountForBill();
		$('input[name="total_amount"]').val(amt);
	});
});
function viewData(id)
{
	switch(default_page)
	{
		case 'client_list':
			var selected_client = $.grep(clients,function(ele)
			{
				return ele.id == id;
			});
			$('.modal-header h4').html('Client Details');
			var html = '<table class="table table-bordered"><tbody><tr><th>Name</th><td>'+selected_client[0].name+'</td></tr><tr><th>Attn Person Name</th><td>'+selected_client[0].atten_person_name+'</td></tr><tr><th>Address</th><td>'+selected_client[0].address+'</td></tr><tr><th>Email address</th><td>'+selected_client[0].email+'</td></tr> <tr><th>Phone Number</th><td>'+selected_client[0].phone_no+'</td></tr><tr><th>Company Website</th><td>'+selected_client[0].website+'</td></tr><tr><th>Company GSTIN</th><td>'+selected_client[0].gst_tin+'</td></tr></tbody>';
				
		break;	
		case 'vendor_list':
			var selected_vendor = $.grep(vendor_data,function(ele)
			{
				return ele.id == id;
			});
			$('.modal-header h4').html('Vendor Details');
			var html = '<table class="table table-bordered"><tbody><tr><th>Vendor name</th><td>'+vendor_data[0].vendor_name+'</td></tr><tr><th>Vendor address</th><td>'+vendor_data[0].vendor_address+'</td></tr><tr><th>Vendor GSTIN</th><td>'+vendor_data[0].vendor_gst_no+'</td></tr><tr><th>Vendor PAN NO/th><td>'+vendor_data[0].vendor_pan_no+'</td></tr><tr><th>Vendor Email Address</th><td>'+vendor_data[0].vendor_email_id+'</td></tr><tr><th>Vendor Mobile No</th><td>'+vendor_data[0].vendor_mobile_no+'</td></tr><tr><th>Vendor Contact Person</th><td>'+vendor_data[0].vendor_contact_person+'</td></tr></tbody></table>';
		break;
		case 'bill_list':
			var selected_bill = $.grep(bill_data,function(ele)
			{
				return ele.id == id;
			});
			$('.modal-header h4').html('Bill Details');
			var html = '<table class="table table-bordered"><tbody><tr><th>Vendor name</th><td colspan="5">'+selected_bill[0].vendor_name+'</td></tr><tr><th>Bill No</th><td>'+selected_bill[0].bill_no+'</td><th>Bill Date</th><td colspan="3">'+selected_bill[0].bill_date+'</td></tr><tr><th>PO No</th><td>'+selected_bill[0].po_no+'</td><th>PO Date</th><td colspan="3">'+selected_bill[0].po_date+'</td></tr><tr><th>Project No</th><td>'+selected_bill[0].project_no+'</td><th>Project Details</th><td colspan="3">'+selected_bill[0].product_details+'</td></tr><tr><th>Taxable Amount</th><td>'+selected_bill[0].basic_price+'</td><th>Other Charges</th><td colspan="3">'+selected_bill[0].other_charges+'</td></tr><tr><th>CGST</th><td>'+selected_bill[0].cgst+'</td><th>SGST</th><td>'+selected_bill[0].sgst+'</td><th>IGST</th><td>'+selected_bill[0].igst+'</td></tr><tr><th>Total Amount</th><td>'+selected_bill[0].total_amount+'</td><th>Amount Paid</th><td colspan="3">'+selected_bill[0].paid_amount+'</td></tr></tbody></table>';
		break;
		case 'product_list':
			var selected_product = $.grep(products,function(ele)
			{
				return ele.id == id;
			});
			$('.modal-header h4').html('Product Details');
			var html = '<table class="table table-bordered"><tbody><tr><th>Product name</th><td>'+selected_product[0].name+'</td></tr><tr><th>Model Number</th><td>'+selected_product[0].model_no+'</td></tr><tr><th>Price (per piece)</th><td>'+selected_product[0].price+'</td></tr><tr><th>Product Description</th><td>'+selected_product[0].description+'</td></tr></tbody></table>';
		break;
		case 'quotation_list':		
			//var id = $(this).parent().parent().attr('data-id');
			window.open('preview.php?id='+id);
			return;
		break;	
	}
	$('.modal-body').html(html);
	$('#myModal').fadeIn();
}
function getTotalAmountForBill()
{
	var cgst = parseFloat($('input[name="cgst"]').val()) || 0 ;
	var sgst = parseFloat($('input[name="sgst"]').val()) || 0;
	var igst = parseFloat($('input[name="igst"]').val()) || 0;
	var basic_price = parseFloat($('input[name="basic_price"]').val()) || 0;
	var other_price = parseFloat($('input[name="other_price"]').val()) || 0;
	var total_amount = cgst + sgst + igst + basic_price + other_price;
	return total_amount;
}
function getBills()
{
	var obj = {'type':'vendor_bill','action':'get','user_id':user_id};
	ajaxCall('api/add_vender_bill.php','POST',obj,function(data)
	{
		var data = $.parseJSON(data);
		bill_data = data.result;
		display('bills');
	});	
}
function addBill()
{
	var validated = true;
	var vendor_id = $('select[name="vendor_name"]').select2('val');
	var bill_date = $('input[name="bill_date"]').val();
	var bill_no = $('input[name="bill_no"]').val();
	var po_no = $('input[name="po"]').val();
	var po_date = $('input[name="po_date"]').val();
	var project_no = $('input[name="project_no"]').val();
	var quantity = $('input[name="quantity"]').val();
	var total_amount = parseFloat($('input[name="total_amount"]').val());
	var paid_amount = parseFloat($('input[name="paid_amount"]').val());
	var product_detail = $('textarea[name="product_detail"]').val();
	var basic_price = $('input[name="basic_price"]').val();
	var other_price = $('input[name="other_price"]').val();
	var cgst = $('input[name="cgst"]').val();
	var sgst = $('input[name="sgst"]').val();
	var igst = $('input[name="igst"]').val();
	var status = 0;
	if(total_amount == paid_amount)
	{
		status = 1;
	}
	if(paid_amount > total_amount)
	{
		alert('Amount paid cannot be greater than total amount');
		return;
	}
	var action = "add";
	if(edit_id != '' && edit_type != '')
	{
		action = 'edit'
	}
	if(vendor_id == "" || bill_no == '' || bill_date == '' || project_no == '' || basic_price == '' || cgst == '' || sgst == '' || igst == '')
	{
		validated = false;
		alert('Fields marked * are compulsory');
	}
	if(validated)
	{
		var obj = {"user_id":user_id,"action":action,"type":"vendor_bill","vendor_id":vendor_id,"bill_date":bill_date,"bill_no":bill_no,"po_no":po_no,"po_date":po_date,"project_no":project_no,
				"quantity":quantity,"basic_price":basic_price,"other_charges":other_price,"cgst":cgst,"sgst":sgst,"igst":igst,"bill_status":status,
				"paid_amount":paid_amount,"total_amount":total_amount,"product_details":product_detail,'id':edit_id};
		ajaxCall('api/add_vender_bill.php','POST',obj,function(data)
		{
			clearData();
			getBills();
			if(edit_id == '' && edit_type == '')
			{
				alert('Bill generated successfully.');
			}
			else
			{
				clearEditData();
				alert('Bill updated successfully');
				$('li [data-content="bill_list"]').click();			
			}
			
		});
	}
}
function updateUser()
{
	var cname = $('input[name="cname"]').val();
	var tagline = $('input[name="ctagline"]').val();
	var address = $('input[name="caddress"]').val();
	var email = $('input[name="cemail"]').val();
	var phone = $('input[name="cphone"]').val();
	var website = $('input[name="cwebsite"]').val();
	var id = $.cookie('user_id');
	var prefix = $('input[name="qprefix"]').val();
	var gstin_no = $('input[name="gstin_no"]').val();
	var invoice_prefix = $('input[name="invoice_prefix"]').val();
	var bank_name =  $('input[name="bank_name"]').val();
	var acc_no =  $('input[name="acc_no"]').val();
	var ifsc =  $('input[name="ifcs_code"]').val();
	var state = $('select[name="state"]').val();
	var obj = {'bank_name':bank_name,'acc_no':acc_no,'ifsc_code':ifsc,'cname':cname,'ctagline':tagline,'caddress':address,'cemail':email,'cphone':phone,'cwebsite':website,'action':'edit','id':id,'qprefix':prefix,'gst_tin':gstin_no,'invoice_prefix':invoice_prefix,'state':state};

	if(cname != '' && tagline != '' && address != '' && email != '' && phone != '' && invoice_prefix != '')
	{
		ajaxCall('api/users.php','POST',obj,function(data)
		{
			getUserData();
			alert('Details updated successfully');
		});
	}
	else
	{
		alert('Fields marked * are compulsory');
	}
}
function getUserData()
{
	var user_id = $.cookie('user_id');
	var action = 'get';
	var obj = {'id':user_id,'action':action};
	ajaxCall('api/users.php','POST',obj,function(data)
	{
		var data = $.parseJSON(data);
		user_data = data.result[0];
	});
}
function addVendor()
{
	var vendor_name = $('input[name="vendor_name"]').val();
	var vendor_address = $('textarea[name="vendor_address"]').val();
	var vendor_gst = $('input[name="vendor_gst"]').val();
	var vendor_pan = $('input[name="vendor_pan"]').val();
	var vendor_email = $('input[name="vendor_email"]').val();
	var vendor_mobile = $('input[name="vendor_mobile"]').val();
	var vendor_contact_person = $('input[name="vendor_contact_person"]').val();
	var action = "add";
	if(edit_id != '' && edit_type != '')
	{
		action = 'edit'
	}	
	var obj = {"user_id":user_id,"vendor_name":vendor_name,"vendor_address":vendor_address,"vendor_gst_no":vendor_gst,"vendor_pan_no":vendor_pan,
	"vendor_email_id":vendor_email,"vendor_contact_person":vendor_contact_person,"vendor_mobile_no":vendor_mobile,"type":"vendor","action":action,'id':edit_id};
	if(vendor_name != '')
	{
		ajaxCall('api/add.php','POST',obj,function(data)
		{
			clearData();
			getVendors();
			if(edit_id == '' && edit_type == '')
			{
				alert('Vendor added successfully');
			}
			else
			{
				clearEditData();
				alert('Vendor updated successfully');
				$('li [data-content="vendor_list"]').click();			
			}		
		});
	}
	else
	{
		alert('Please enter vendor name');
	}	
}
function clearEditData()
{
	edit_id = '';
	edit_type = '';
}
function addInvoice() 
{
	var action = 'add';
	var id = '';
	if(edit_id != '' && edit_type == 'invoice')
	{
		action = 'update';
		id = edit_id;
	}
	var validated = true;
	var invoice_type = $('select[name="invoice_type"]').val();
	var reverse_charge = $('select[name="rever_charge"]').val();
	var transport_mode = $('input[name="transport_mode"]').val();
	var vehicle_number = $('input[name="vehicle_no"]').val();
	var ewaybill_no = $('input[name="eway"]').val();
	var supply_place = $('input[name="supply_place"]').val();
	var client_name = $('select[name="client"]').select2('data')[0].text;
	var po = $('input[name="po"]').val();
	var po_date = $('input[name="po_date"]').val();
	var client_address = $('textarea[name="client_address"]').val();
	var client_state = $('select[name="client_state"]').val();
	var consigne_name = $('input[name="consigne_name"]').val();
	var consigne_state = $('select[name="consigne_state"]').val();
	var consigne_address = $('textarea[name="consigne_address"]').val();
	var supply_date = $('input[name="supply_date"]').val();
	var freight_charge = $('input[name="freight_charge"]').val();
	var loading_charge = $('input[name="loading_charge"]').val();
	var other_charge = $('input[name="other_charge"]').val();
	var freight_cgst = $('select[name="freight_cgst"]').val();
	var freight_sgst = $('select[name="freight_sgst"]').val();
	var freight_igst = $('select[name="freight_igst"]').val();
	var loading_cgst = $('select[name="loading_cgst"]').val();
	var loading_sgst = $('select[name="loading_sgst"]').val();
	var loading_igst = $('select[name="loading_igst"]').val();
	var other_cgst = $('select[name="other_cgst"]').val();
	var other_sgst = $('select[name="other_sgst"]').val();
	var other_igst = $('select[name="other_igst"]').val();

	var p_arr = [];
	var p_dis_arr = [];
	var p_amt_arr = [];
	var p_hsn_arr = [];
	var p_qty_arr = [];
	var cgst_arr = [];
	var sgst_arr = [];
	var igst_arr = [];
	var umo_arr = [];
	var gstin_no = $('input[name="gstin_no"]').val();
	var length = $('select[name="product[]"]').length;
	for(var i=0;i<length;i++)
	{
		var hsn_code = $($('input[name="hsn_code[]"]')[i]).val();	
		var p_discount = $($('input[name="product_discount[]"]')[i]).val();
		var p_amount = $($('input[name="price[]"]')[i]).val();
		var p_quantity = $($('input[name="quantity[]"]')[i]).val();
		var cgst = $($('select[name="cgst[]"]')[i]).val();
		var sgst = $($('select[name="sgst[]"]')[i]).val();
		var igst = $($('select[name="igst[]"]')[i]).val();
		var product_name = $($('select[name="product[]"]')[i]).select2('data')[0].text;
		var umo = $($('select[name="umo[]"]')[i]).val();
		p_arr.push(product_name);
		p_dis_arr.push(p_discount);
		p_amt_arr.push(p_amount);
		p_hsn_arr.push(hsn_code);
		p_qty_arr.push(p_quantity);
		cgst_arr.push(cgst);
		sgst_arr.push(sgst);
		igst_arr.push(igst);
		umo_arr.push(umo);
		if(product_name == '' || p_amount == '' || p_quantity == '' || client_name.toLowerCase() == 'select' || reverse_charge == '' || transport_mode == '' || supply_place == '' || supply_date == '')
		{
			validated = false;
			break;
		}
	}
	if(validated)
	{
		var obj = {"id":id,"product_name":p_arr,"hsn_code":p_hsn_arr,"umo":umo_arr,"poduct_quantity":p_qty_arr,"product_rate":p_amt_arr,"discount":p_dis_arr,
			"cgst":cgst_arr,"sgst":sgst_arr,"igst":igst_arr,"reverse_charge":reverse_charge,"state":client_state,"eway_bill_no":ewaybill_no,
			"transport_mode":transport_mode,"vehicle_no":vehicle_number,"supply_date":supply_date,"supply_place":supply_place,"client_name":client_name,
			"client_address":client_address,"po_no":po,"invoice_type":invoice_type,"freight_charge":freight_charge,"package_charge":loading_charge,"other_charge":other_charge,"consigne_name":consigne_name,"consigne_state":consigne_state,"consigne_address":consigne_address,"action":action,
			"user_id":user_id,"type":"invoice","gstin_no":gstin_no,"po_date":po_date,'freight_cgst':freight_cgst,'freight_sgst':freight_sgst,'freight_igst':freight_igst,
			"loading_cgst":loading_cgst,"loading_sgst":loading_sgst,"loading_igst":loading_igst,"other_cgst":other_cgst,"other_sgst":other_sgst,"other_igst":other_igst
		};
		
		ajaxCall('api/add_invoice.php','POST',obj,function(data)
		{
			clearData();
			getInvoices();
			alert('Invoice generated successfully.');	
		});
	}
	else
	{
		alert('Fields marked * are compulsory');
	}
	
}
function addProduct()
{
	var name = $('input[name="name"]').val();
	var model = $('input[name="modelno"]').val();
	var price = $('input[name="price"]').val();
	var type = "product";
	var action = 'add';
	if(edit_id != '' && edit_type == 'product')
	{
		action = 'edit';
	}
	var description = CKEDITOR.instances.product_description.getData();
	var obj = {'type':'product','action':action,'user_id':user_id,'name':name,'price':price,'description':description,'model_no':model,'id':edit_id};
	
	if(name == '' || price == '')
	{
		alert('Fields marked * are compulsary.');
		return false;
	}
	ajaxCall(addurl,'POST',obj,function(data)
	{
		var data = $.parseJSON(data);	
		if(data.success)
		{
			
			getProducts();
			clearData();
			CKEDITOR.instances.product_description.setData();
			if(edit_id == '' && edit_type == '')
			{
				alert('Product added successfully');
			}
			else
			{
				clearEditData();
				alert('Product updated successfully');
				$('li [data-content="product_list"]').click();
			}
		}
		else
		{
			alert('Failed to add product.Please check all fields');
		}
			
	});
	
}

function getClient()
{
	var obj = {'type':'client','action':'get','user_id':user_id};
	ajaxCall(geturl,'POST',obj,function(data)
	{
		var data = $.parseJSON(data);
		clients = data.result;
		display('clients');
	});	
}
function getProducts()
{
	var obj = {'type':'product','action':'get','user_id':user_id};
	ajaxCall(geturl,'POST',obj,function(data)
	{
		var data = $.parseJSON(data);
		products = data.result;
		display('products');
	});	
}
function getVendors()
{
	var obj = {'type':'vendor','action':'get','user_id':user_id};
	ajaxCall('api/get.php','POST',obj,function(data)
	{
		var data = $.parseJSON(data);
		vendor_data = data.result;
		display('vendors');
	});
}
function getQuotation()
{
	var obj = {'type':'quotation','action':'get','user_id':user_id};
	ajaxCall('api/add_quotation.php','POST',obj,function(data)
	{
		var data = $.parseJSON(data);
		quotations = data;
		display('quotation');
	});	
}
function getInvoices()
{
	var obj = {'type':'invoice','action':'get','user_id':user_id};
	ajaxCall('api/add_invoice.php','POST',obj,function(data)
	{
		var data = $.parseJSON(data);
		invoice_data = data.result;
		display('invoices');
	});	
}
function addQuotation()
{
	var clientid = $('select[name="client"]').select2('val');
	var productid = [];
	var flag = false;
	$('select[name="product[]"]').each(function() {
		if($(this).select2('val') == '' || $(this).select2('val') == null)
		{
			flag = true;
		}
		else
		{
			productid.push($(this).select2('val'));
		}
	});
	var price = [];
	$('input[name="price[]"]').each(function() {
		if($(this).val() == '')
		{
			flag = true;
		}
		else
		{
			price.push($(this).val());
		}
	});
	var attn_name = $('input[name="attnp_name"]').val();
	var product_quantity = [];
	$('input[name="quantity[]"]').each(function() {
		if($(this).val() == '')
		{
			flag = true;
		}
		else
		{
			product_quantity.push($(this).val());
		}
	});
	var discount = $('input[name="discout"]').val();
	var tax_term = $('select[name="tax_term"] option:selected').text();
	var delivery_term = $('select[name="delivery_term"] option:selected').text();
	var payment_term = $('select[name="payment_term"] option:selected').text();
	var pf_term = $('select[name="pf_terms"] option:selected').text();
	var freight_term = $('select[name="freight_term"] option:selected').text();
	var enquiry_from = $('select[name="enquiry"] option:selected').text();
	if(delivery_term.toLowerCase() == 'select')
	{
		delivery_term = '';
	}
	if(payment_term.toLowerCase() == 'select')
	{
		payment_term = '';
	}
	if(pf_term.toLowerCase() == 'select')
	{
		pf_term = '';
	}
	if(freight_term.toLowerCase() == 'select')
	{
		freight_term = '';
	}
	if(tax_term.toLowerCase() == 'select')
	{
		tax_term = '';
	}
	if(clientid != '' && attn_name != '' && !flag)
	{
		var obj = {'user_id':user_id,'client_id':clientid,'product_id':productid,'enquiry_type':enquiry_from,'product_price':price,'product_quantity':product_quantity,'discount':discount,'tax_term_id':tax_term,'delivery_term_id':delivery_term,'pf_term_id':pf_term,'payment_term_id':payment_term,'freight_term_id':freight_term,'action':'add','type':'quotation'};
		ajaxCall('api/add_quotation.php','POST',obj,function(data)
		{
			var data = $.parseJSON(data);
			if(data.success)
			{
				clearData();
				getQuotation();
				alert('Quotation generated successfully.');
			}
			else
			{
				alert('Failed to generate quotation.');
			}
		});
	}
	else
	{
		alert('Fields marked * are compulsory');
	}
}
function clearData()
{
	$('input[type="text"],input[type="number"],textarea').val('');
	$('select').val('').trigger('change');
}
function addClient()
{
	var name = $('input[name="cname"]').val();
	var address = $('input[name="address"]').val();
	var email = $('input[name="cemail"]').val();
	var phone = $('input[name="cphone"]').val();
	var website = $('input[name="cwebsite"]').val();
	var att_name = $('input[name="att_name"]').val();
	var action = 'add';
	var gst_tin = $('input[name="company_gst"]').val();
	var client_state = $('select[name="state"]').val();
	var client_pan = $('input[name="pan_no"]').val();
	if(edit_id != '' && edit_type != '')
	{
		action = 'edit'
	}	
	var obj = {'type':'client','action':action,'user_id':user_id,'name':name,'address':address,'email':email,'phone_no':phone,'website':website,
	'atten_person_name':att_name,'id':edit_id,"client_gst":gst_tin,'state':client_state,'client_pan':client_pan};
	if(name == '' || address == '' || att_name == '' || email == '' || phone == '')
	{
		alert('Fields marked * are compulsary.');
		return false;
	}
	else if(client_pan.length > 0 && client_pan.length < 10)
	{
		alert('Please enter valid pan number');
		return false;
	}
	ajaxCall(addurl,'POST',obj,function(data)
	{
		var data = $.parseJSON(data);
		if(data.success)
		{
			clearData();
			getClient();
			if(edit_id == '' && edit_type == '')
			{
				alert('Client added successfully');
			}
			else
			{
				clearEditData();
				alert('Client updated successfully');
				$('li [data-content="client_list"]').click();
			}
		}
		else
		{
			alert('Failed to add client.Please check all fields');
		}
	});	
}

function ajaxCall(url,method,data,success_cb)
{
	$.ajax({
		url:url,
		type:method,
		data:data,
		beforeSend:function()
		{
			 $('.loading-container').show();
		},
		success:function(data)
		{
			 $('.loading-container').fadeOut();
			success_cb(data);
		}
	});
}
function getMarkup(page,success_cb)
{
	$('.loading-container').show();
	$.ajax({
		url: page + '.html',
		success:function(data)
		{
			$('#main').html(data);
			$('.loading-container').hide();	
			if(is_mobile)
			{
				$('.top-head.container-fluid').show();
			}
			else
			{
				$('.top-head.container-fluid').hide();
			}					
			switch(page)
			{
				case 'product_list':
					display('products');
					break;
				case 'add_product':
					if(edit_type == 'product')
					{
						$('textarea[name="product_description"]').ckeditor();
						populateData('product');
					}
					break;	
				case 'quotation_list':
					display('quotation');
					break;
				case 'add_quotation':
					fillDropDowns(0);
					break;	
				case 'invoice_list':
					display('invoices');
					break;
				case 'add_invoice':
						var state_mkup = getStateMarkup();
						$('select[name="client_state"]').html(state_mkup);
						$('select[name="consigne_state"]').html(state_mkup);
						fillDropDowns(0);
						$('input[name="supply_date"]').datepicker({minDate: new Date,dateFormat: 'dd-mm-yy'});
						$('input[name="po_date"]').datepicker({maxDate: new Date,dateFormat: 'dd-mm-yy'});
					break;	
				case 'client_list':
					display('clients');
					break;
				case 'add_client':
					var state_mkup = getStateMarkup();
					$('select[name="state"]').html(state_mkup);
					break;
				case 'company_profile':
						populateData('user');
					break;				
				case 'vendor_list':
						display('vendors');
					break;
				case 'add_bill':
					fillDropDowns(0);
					$('input[name="bill_date"]').datepicker({maxDate: new Date,dateFormat: 'dd-mm-yy'});
					$('input[name="po_date"]').datepicker({maxDate: new Date,dateFormat: 'dd-mm-yy'});
					break;
				case 'bill_list':
					display('bills');
					break;
			}			
			$('textarea[name="product_description"]').ckeditor();
			if(success_cb)
			{
				success_cb();
			}
		}
	});
}

function populateData(type)
{
	switch(type)
	{
		case 'product':
			var selected_product = $.grep(products,function(ele)
			{
				return ele.id == edit_id;
			});
			var name = selected_product[0].name;
			var model = selected_product[0].model_no;
			var price = selected_product[0].price;
			var description = selected_product[0].description;
			$('input[name="name"]').val(name);
			$('input[name="modelno"]').val(model);
			$('input[name="price"]').val(price);
			CKEDITOR.instances.product_description.setData(description);
			break;
		case 'client':
			var seleced_client = $.grep(clients,function(ele)
			{
				return ele.id == edit_id;
			});
			var state = seleced_client[0].state;
			var name = seleced_client[0].name;
			var att_per_name = seleced_client[0].atten_person_name;
			var email = seleced_client[0].email;
			var address = seleced_client[0].address;
			var phone = seleced_client[0].phone_no;
			var website = seleced_client[0].website;
			var client_gst = seleced_client[0].gst_tin;
			var state_mkup = getStateMarkup();
			var pan_no =  seleced_client[0].pan_no;
			$('select[name="state"]').html(state_mkup);
			$('select[name="state"]').val(state);
			$('input[name="cname"]').val(name);
			$('input[name="att_name"]').val(att_per_name);
			$('input[name="address"]').val(address);
			$('input[name="cemail"]').val(email);
			$('input[name="cphone"]').val(phone);
			$('input[name="cwebsite"]').val(website);
			$('input[name="company_gst"]').val(client_gst);
			$('input[name="pan_no"]').val(pan_no);
			break;
		case 'user'	:
			$('input[name="cname"]').val(user_data.cname);
			$('input[name="ctagline"]').val(user_data.ctagline);
			$('input[name="caddress"]').val(user_data.caddress);
			$('input[name="cemail"]').val(user_data.cemail);
			$('input[name="cphone"]').val(user_data.cphone);
			$('input[name="cwebsite"]').val(user_data.cwebsite);
			$('input[name="qprefix"]').val(user_data.quotation_prefix);
			$('input[name="gst_tin"]').val(user_data.gst_tin);
			$('input[name="invoice_prefix"]').val(user_data.invoice_prefix);
			$('input[name="bank_name"]').val(user_data.bank_name);
			$('input[name="acc_no"]').val(user_data.acc_no);
			$('input[name="ifcs_code"]').val(user_data.ifsc_code);
			$('select[name="state"]').val(user_data.state);
			break;
		case 'vendor':
			var selected_vendor = $.grep(vendor_data,function(ele)
			{
				return ele.id == edit_id;
			});
			$('input[name="vendor_name"]').val(selected_vendor[0].vendor_name);
			$('textarea[name="vendor_address"]').val(selected_vendor[0].vendor_address);
			$('input[name="vendor_gst"]').val(selected_vendor[0].vendor_gst_no);
			$('input[name="vendor_pan"]').val(selected_vendor[0].vendor_pan_no);
			$('input[name="vendor_email"]').val(selected_vendor[0].vendor_email_id);
			$('input[name="vendor_mobile"]').val(selected_vendor[0].vendor_mobile_no);
			$('input[name="vendor_contact_person"]').val(selected_vendor[0].vendor_contact_person);
			break;
		case 'bill':
			var selected_bill = $.grep(bill_data,function(ele)
			{
				return ele.id == edit_id;
			});
			$('select[name="vendor_name"]').val(selected_bill[0].vendor_id).trigger('change');
			$('input[name="bill_date"]').val(selected_bill[0].bill_date);
			$('input[name="bill_no"]').val(selected_bill[0].bill_no);
			$('input[name="po"]').val(selected_bill[0].po_no);
			$('input[name="po_date"]').val(selected_bill[0].po_date);
			$('input[name="project_no"]').val(selected_bill[0].project_no);
			$('input[name="quantity"]').val(selected_bill[0].quantity);
			$('input[name="basic_price"]').val(selected_bill[0].basic_price);
			$('input[name="other_price"]').val(selected_bill[0].other_charges);
			$('input[name="paid_amount"]').val(selected_bill[0].paid_amount);
			$('input[name="cgst"]').val(selected_bill[0].cgst);
			$('input[name="sgst"]').val(selected_bill[0].sgst);
			$('input[name="igst"]').val(selected_bill[0].igst);
			$('textarea[name="product_detail"]').val(selected_bill[0].product_details);
			var amt = getTotalAmountForBill();
			$('input[name="total_amount"]').val(amt);
			$('input').prop('disabled','disabled');
			$('input[name="paid_amount"]').prop('disabled',false);
			$('input[name="save"]').prop('disabled',false);
			$('input[name="reset"]').prop('disabled',false);
			$('textarea').prop('disabled','disabled');
			break;
		case 'invoice':
			var selected_invoice = $.grep(invoice_data,function(ele)
			{
				return ele.id == edit_id;
			})[0];
			var product = selected_invoice.product;
			var product_mkup = '';
			$('#invoice_product_container').html(product_mkup);
			for(var i=0;i<product.length;i++)
			{
				product_mkup = '<div class="single-product"><div class="form-group"><label class="col-sm-1 control-label left">Name<span class="compulsory">*</span></label><div class="col-sm-5"><select name="product[]" class="form-control" data-index="'+length+'"></select></div><label class="col-sm-1 control-label left">Quantity<span class="compulsory">*</span></label><div class="col-sm-5"><input type="number" name="quantity[]" min="1" class="form-control"></div></div><div class="form-group"><label class="col-sm-1 control-label left">Amount<span class="compulsory">*</span></label><div class="col-sm-5"><input type="text" name="price[]" class="form-control"></div><label class="col-sm-1 control-label left">Discount<span class="compulsory">*</span></label><div class="col-sm-5"><input type="number" name="product_discount[]" class="form-control" min="0"></div></div><div class="form-group"><label class="col-sm-1 control-label left">HSN/SAC Code</label><div class="col-sm-5"><input type="text" name="hsn_code[]" class="form-control"></div><label class="col-sm-1 control-label left">UMO</label><div class="col-sm-5"><select name="umo[]" class="form-control"><option value="Nos">Nos</option><option value="Days">Days</option><option value="Sets">Sets</option><option value="Unit">Unit</option></select></div></div><div class="form-group"><label class="col-sm-1 control-label left cgst">CGST</label><div class="col-sm-3 cgst"><select name="cgst[]" class="form-control typeahead "><option value="0">0%</option><option value="2.5">2.5%</option><option value="6">6%</option><option value="9">9%</option><option value="14">14%</option></select></div><label class="col-sm-1 control-label left sgst">SGST</label><div class="col-sm-3 sgst"><select name="sgst[]" class="form-control typeahead"><option value="0">0%</option><option value="2.5">2.5%</option><option value="6">6%</option><option value="9">9%</option><option value="14">14%</option></select></div><label class="col-sm-1 control-label left igst">IGST</label><div class="col-sm-3 igst"><select name="igst[]" class="form-control typeahead"><option value="0">0%</option><option value="2.5">2.5%</option><option value="6">6%</option><option value="9">9%</option><option value="14">14%</option></select></div></div><div class="form-group"><div class="col-md-12 text-center col-sm-12"><input type="button" class="remove_product btn btn-primary btn-danger" value="Remove Product"></div></div>';
				$('#invoice_product_container').append(product_mkup);
				fillDropDowns(i);				
			}
			$('select[name="invoice_type"]').val(selected_invoice.invoice_type);
			$('select[name="client"] option:contains('+selected_invoice.client_name+')').attr('selected','selected').trigger('change')
			$('select[name="rever_charge"]').val(selected_invoice.reverse_charge);
			$('input[name="transport_mode"]').val(selected_invoice.transport_mode);
			$('input[name="gstin_no"]').val(selected_invoice.client_gsttin);
			$('input[name="vehicle_no"]').val(selected_invoice.vehicle_no);
			$('input[name="eway"]').val(selected_invoice.eway_bill_no);
			$('input[name="supply_place"]').val(selected_invoice.supply_place);
			$('input[name="supply_date"]').val(selected_invoice.supply_date);
			$('input[name="freight_charge"]').val(selected_invoice.freight_charge);
			$('input[name="loading_charge"]').val(selected_invoice.loading_package_charge);
			$('input[name="other_charge"]').val(selected_invoice.other_charge);
			$('input[name="po"]').val(selected_invoice.po_no);
			$('input[name="po_date"]').val(selected_invoice.po_date);
			$('textarea[name="client_address"]').val(selected_invoice.client_address);
			$('select[name="client_state"]').val(selected_invoice.state);
			$('input[name="consigne_name"]').val(selected_invoice.consignee_name);
			$('select[name="consigne_state"]').val(selected_invoice.consignee_state);
			$('select[name="freight_cgst"]').val(selected_invoice.freight_cgst);
			$('select[name="freight_sgst"]').val(selected_invoice.freight_sgst);
			$('select[name="freight_igst"]').val(selected_invoice.freight_igst);
			$('select[name="loading_cgst"]').val(selected_invoice.loading_cgst);
			$('select[name="loading_sgst"]').val(selected_invoice.loading_sgst);
			$('select[name="loading_igst"]').val(selected_invoice.loading_igst);
			$('select[name="other_cgst"]').val(selected_invoice.other_cgst);
			$('select[name="other_sgst"]').val(selected_invoice.other_sgst);
			$('select[name="other_igst"]').val(selected_invoice.other_igst);
			$('textarea[name="consigne_address"]').val(selected_invoice.consignee_address);
			
			for(var i=0;i<product.length;i++)
			{
				$('select[name="product[]"] option:contains('+product[i].product_name+')').attr('selected','selected').trigger('change')
				//$($('select[name="product[]"]')[i]).select2("val", $('select[name="product[]"] option:contains('+product[i].product_name+')').val());
				//$($('select[name="product[]"]')[i]).select2("val", $('select[name="product[]"] option:contains("PLC PROGRAMMING AND SERVICE CHARGE")').val());
				$($('select[name="cgst[]"]')[i]).val(product[i].cgst);	
				$($('select[name="sgst[]"]')[i]).val(product[i].sgst);	
				$($('select[name="igst[]"]')[i]).val(product[i].igst);	
				$($('select[name="umo[]"]')[i]).val(product[i].umo);	
				$($('input[name="price[]"]')[i]).val(product[i].product_rate);	
				$($('input[name="product_discount[]"]')[i]).val(product[i].discount);	
				$($('input[name="hsn_code[]"]')[i]).val(product[i].hsn_code);	
				$($('input[name="quantity[]"]')[i]).val(product[i].product_quantity);	
			} 
			if(selected_invoice.state == user_data.state)
			{
				$('select[name="freight_igst"],select[name="loading_igst"],select[name="other_igst"],select[name="igst[]"]').val(0);
				$('.igst').hide();
				$('.cgst,.sgst').show();
			}
			else
			{
				$('select[name="loading_cgst"],select[name="loading_sgst"],select[name="freight_cgst"],select[name="freight_sgst"],select[name="other_cgst"],select[name="other_sgst"],select[name="cgst[]"],select[name="sgst[]"]').val(0)
				$('.cgst,.sgst').hide();
				$('.igst').show();
			}
			
			break;
	}
}
function fillDropDowns(index)
{
	var client_length = clients.length;
	var product_legth = products.length;
	var vendor_length = vendor_data.length;
	var html = '<option value="">Select</option>';
	for(var i=0;i<client_length;i++)
	{
		html += '<option value="'+clients[i].id+'">'+clients[i].name+'</option>';
	}
	$($('select[name="client"]')[index]).html(html);
	html = '<option value="">Select</option>';
	for(var i=0;i<product_legth;i++)
	{
		html += '<option value="'+products[i].id+'">'+products[i].name+'</option>';
	}	
	$($('select[name="product[]"]')[index]).html(html);	
	if(default_page == 'add_quotation')
	{
		$select = $('select[name="client"],select[name="product[]"]').select2();
	}
	else if(default_page == 'add_invoice')
	{
		$select = $('select[name="client"],select[name="product[]"]').select2({
			tags:true
		});
	}
	else if(default_page == 'add_bill')
	{
		html = '<option value="">Select</option>';
		for(var i=0;i<vendor_length;i++)
		{
			html += '<option value="'+vendor_data[i].id+'">'+vendor_data[i].vendor_name+'</option>';
		}
		$($('select[name="vendor_name"]')[index]).html(html);
		$('select[name="vendor_name"]').select2();
	}
	select2Change();
	
}
function select2Change()
{
	if($select)
	{
		$select.on('select2:select',function(a,b,c)
		{
			console.log(a.currentTarget);
			var name = $(a.currentTarget).attr('name');
			switch(name)
			{
				case 'client':
					var val = $('select[name="client"]').select2('val');
					var client = $.grep(clients,function(ele)
					{
						return ele.id == val;
					});
					if(client.length > 0)
					{
						selected_client = client[0]; 
						var att_per_name = client[0].atten_person_name;
						$('input[name="attnp_name"]').val(att_per_name);
						$('input[name="consigne_name"]').val($('select[name="client"]').select2('data')[0].text);
						$('select[name="client_state"]').val(client[0].state)
						$('select[name="consigne_state"]').val(client[0].state)
						$('input[name="gstin_no"]').val(client[0].gst_tin);
						$('textarea[name="client_address"]').val(client[0].address);
						$('textarea[name="consigne_address"]').val(client[0].address);
						if(user_data.state != client[0].state)
						{
							$('select[name="loading_cgst"],select[name="loading_sgst"],select[name="freight_cgst"],select[name="freight_sgst"],select[name="other_cgst"],select[name="other_sgst"],select[name="cgst[]"],select[name="sgst[]"]').val(0)
							$('.igst').show();
							$('.cgst,.sgst').hide();
						}
						else
						{
							$('select[name="freight_igst"],select[name="loading_igst"],select[name="other_igst"],select[name="igst[]"]').val(0);
							$('.igst').hide();
							$('.cgst,.sgst').show();
						}
					}
					else
					{
						$('input[name="attnp_name"]').val('');
						$('input[name="consigne_name"]').val('').trigger('change');
						$('select[name="client_state"]').val('')
						$('select[name="consigne_state"]').val('')
						$('input[name="gstin_no"]').val('');
						$('textarea[name="client_address"]').val('');
						$('textarea[name="consigne_address"]').val('');
					}
					break;
				case 'product[]':
					var val = $(this).select2('val');
					var index = $(a.currentTarget).attr('data-index');
					var product = $.grep(products,function(ele)
					{
						return ele.id == val;
					});
					if(product.length > 0)
					{
						var price = product[0].price;
						$($('input[name="price[]"]')[index]).val(price);
					}
					else
					{
						$($('input[name="price[]"]')[index]).val('');
					}
					break;
			}
		});
	}
}
function display(type)
{
	var html = '';
	if(table)
		table.destroy();
	if(type == 'clients')
	{
		var length = clients.length;
		html += '<thead><tr role="row"><th>Sr. no.</th><th>Name</th><th>Attn Person Name</th><th>Address</th><th>Email</th><th>Phone</th><th>Registration Date</th><th>Action</th></tr></thead><tbody>';
		for(var i=0;i<length;i++)
		{
			
			var name = clients[i].name;
			var attn_name = clients[i].atten_person_name || '-';
			var address = clients[i].address || '-';
			var email = clients[i].email || '-';
			var phone = clients[i].phone_no || '-';
			var site = clients[i].website || '-';
			var date = clients[i].date.split(' ')[0];
			html += '<tr data-id="'+clients[i].id+'"><td>'+(i + 1)+'</td><td>'+name+'</td><td>'+attn_name+'</td><td>'+address+'</td><td>'+email+'</td><td>'+phone+'</td><td>'+date+'</td><td><span class="view">View</span><span class="edit">Edit</span><span class="delete">Delete</span></td></tr>';
		}
	}
	else if(type == 'products')
	{
		var length = products.length;
		html += '<thead><tr><th>Sr. no.</th><th>Name</th><th>Model No</th><th>Price</th><th>Action</th></tr></thead><tbody>';
		for(var i=0;i<length;i++)
		{
			var name = 	products[i].name;
			var model = products[i].model_no || '-';
			var price = products[i].price || '-';
			html += '<tr data-id="'+products[i].id+'"><td>'+(i + 1)+'</td><td>'+name+'</td><td>'+model+'</td><td>'+price+'</td><td><span class="view">View</span><span class="edit">Edit</span><span class="delete">Delete</span></td></tr>';
		}
		
	}
	else if(type == 'quotation')
	{
		var length = quotations.result.length;		
		html += '<thead><tr><th>Sr. no.</th><th>Client Name</th><th>Products</th><th>Quantity</th><th>Price</th><th>Discount</th><th>Quotation Amount</th><th>Action</th></tr></thead><tbody>';
		for(var i=0;i<length;i++)
		{
			var p_len = quotations.result[i].product.length;			
			html += '<tr data-id="'+quotations.result[i].id+'"><td>'+(i + 1)+'</td><td>'+quotations.result[i].client_name+'</td>';			
			var amount = 0;
			var products_txt = '';
			var quantity_txt = '';
			var price_txt = '';
			for(var j=0;j<p_len;j++)
			{
				products_txt += quotations.result[i].product[j].name;
				quantity_txt += quotations.result[i].product[j].quantity;
				price_txt += quotations.result[i].product[j].price;
				if(j!=p_len-1)
				{
					products_txt += ',';
					quantity_txt += ',';
					price_txt += ',';
				}				
				amount += parseFloat(quotations.result[i].product[j].price * quotations.result[i].product[j].quantity);
			}
			var discount = quotations.result[i].discount || 0;
			amount = amount - ((discount/100) * amount)
			html += '<td>'+products_txt+'</td><td>'+quantity_txt+'</td><td>'+price_txt+'</td><td>'+quotations.result[i].discount+'%</td><td>'+amount+'</td><td><span class="view">View</span><span class="download">Download</span><span class="delete">Delete</span></td></tr>';
			
		}					
	}
	else if(type == 'invoices')
	{
		var length = invoice_data.length;
		html += '<thead><tr><th>Sr. no.</th><th>Client Name</th><th>Invoice No</th><th>Invoice Date</th><th>Products</th><th>Quantity</th><th>Price</th><th>Discount</th><th>GST</th><th>Invoice Amount</th><th>Action</th></tr></thead><tbody>';
		var invoice_prefix = user_data.invoice_prefix || '';
		var fiscalYear = getCurrentFiscalYear();
		for(var i=0;i<length;i++)
		{
			var p_len = invoice_data[i].product.length;			
			html += '<tr data-id="'+invoice_data[i].id+'"><td>'+(i + 1)+'</td><td>'+invoice_data[i].client_name+'</td><td>'+invoice_prefix+invoice_data[i].id+'-'+fiscalYear+'</td><td>'+formatDate(invoice_data[i].created_date.split(' ')[0])+'</td>';			
			var amount = 0;
			var products_txt = '';
			var quantity_txt = '';
			var price_txt = '';
			var discount_txt = '';
			var gst_txt = '';
			for(var j=0;j<p_len;j++)
			{
				products_txt += invoice_data[i].product[j].product_name;
				quantity_txt += invoice_data[i].product[j].product_quantity;
				price_txt += invoice_data[i].product[j].product_rate;
				discount_txt += invoice_data[i].product[j].discount;
				gst_txt += invoice_data[i].product[j].cgst;
				var gst = parseFloat(invoice_data[i].product[j].cgst) + parseFloat(invoice_data[i].product[j].sgst) + parseFloat(invoice_data[i].product[j].igst);
				if(j!=p_len-1)
				{
					products_txt += '<br>';
					quantity_txt += '<br>';
					price_txt += '<br>';
					discount_txt += '%<br>';
					gst_txt += '%<br>';
				}
				var product_amount = parseFloat(invoice_data[i].product[j].product_rate * invoice_data[i].product[j].product_quantity);	
				product_amount -= (parseFloat(invoice_data[i].product[j].discount) / 100) * product_amount;
				product_amount += parseFloat(gst / 100) * product_amount;
				amount += parseFloat(product_amount);
			}
			
			//amount = amount - ((discount/100) * amount)
			html += '<td>'+products_txt+'</td><td>'+quantity_txt+'</td><td>'+price_txt+'</td><td>'+discount_txt+'%</td><td>'+gst_txt+'%</td><td>'+amount.toFixed(2)+'</td><td><span class="download">Download</span><span class="edit">Edit</span><span class="delete">Delete</span></td></tr>';	
		}
	}
	else if(type == 'vendors')
	{
		var length = vendor_data.length;
		html += '<thead><tr><th>Sr. no.</th><th>Name</th><th>GSTIN</th><th>PAN NO</th><th>Contact Person</th><th>Email</th><th>Mobile</th><th>Registration Date</th><th>Action</th></tr></thead><tbody>';
		for(var i=0;i<length;i++)
		{
			html += '<tr data-id="'+vendor_data[i].id+'"><td>'+(i + 1)+'</td><td>'+vendor_data[i].vendor_name+'</td><td>'+vendor_data[i].vendor_gst_no+'</td><td>'+vendor_data[i].vendor_pan_no+'</td><td>'+vendor_data[i].vendor_contact_person+'</td><td>'+vendor_data[i].vendor_email_id+'</td><td>'+vendor_data[i].vendor_mobile_no+'</td><td>'+vendor_data[i].date.split(' ')[0]+'</td><td><span class="view">View</span><span class="edit">Edit</span><span class="delete">Delete</span></td></tr>';
		}
	}
	else if(type == 'bills')
	{
		var length = bill_data.length;
		html += '<thead><tr role="row"><th>Sr. no.</th><th>Vendor Name</th><th>Date</th><th>Bill No</th><th>Project No</th><th>Total Amount</th><th>Paid Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>';
		for(var i=0;i<length;i++)
		{
			var status = 'UnPaid';
			if(bill_data[i].bill_status == '1')
				status = 'Settled';
			html += '<tr data-id="'+bill_data[i].id+'"><td>'+(i + 1)+'</td><td>'+bill_data[i].vendor_name+'</td><td>'+bill_data[i].bill_date+'</td><td>'+bill_data[i].bill_no+'</td><td>'+bill_data[i].project_no+'</td><td>'+bill_data[i].total_amount+'</td><td>'+bill_data[i].paid_amount+'</td><td>'+status+'</td><td><span class="view">View</span><span class="edit">Edit</span><span class="delete">Delete</span></td></tr>';
		}
	}
	html += '</tbody>';
	$('#basic-datatable').html(html);
	table = $('#basic-datatable').DataTable();
}
function getCurrentFiscalYear() {
    var today = new Date();
    var curMonth = today.getMonth();
     
    var fiscalYr = "";
    if (curMonth > 3) 
	{ 
        var nextYr1 = (today.getFullYear() + 1).toString();
        fiscalYr = today.getFullYear().toString().substr(-2) + "/" + nextYr1.charAt(2) + nextYr1.charAt(3);
    } 
	else
	{
        var nextYr2 = today.getFullYear().toString();
        fiscalYr = (today.getFullYear() - 1).toString().substr(-2) + "/" + nextYr2.charAt(2) + nextYr2.charAt(3);
    }
     
    return fiscalYr;
}
function formatDate(date)
{
	var day = date.split('-')[2];
	var month = date.split('-')[1];
	var year = date.split('-')[0];
	return day + '-' + month + '-' + year;
}
function getDeliveryTerms()
{
	ajaxCall('api/get_delivery_terms.php','get','',function(data)
	{
		deliery_terms = data.terms;
	});
}
function getFreightTerms()
{
	ajaxCall('api/get_frieight_terms.php','get','',function(data)
	{
		freight_terms = data.terms;
	});
}
function getPfTerms()
{
	ajaxCall('api/get_pf_terms.php','get','',function(data)
	{
		pf_terms = data.terms;
	});
}
function getTaxTerms()
{
	ajaxCall('api/get_tax_terms.php','get','',function(data)
	{
		tax_terms = data.terms;
	});
}
function getPaymentTerms()
{
	ajaxCall('api/get_payment_terms.php','get','',function(data)
	{
		payment_terms = data.terms;
	});
}
function getStateMarkup()
{
	var html = '<option value="">Select</option>';
	var arr = ["Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh","Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kenmore", "Kerala", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha","Pondicherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "Vaishali", "West Bengal"];
	for(var i=0;i<arr.length;i++)
	{
		html += '<option value="'+arr[i]+'">'+arr[i]+'</option>';
	}
	return html;
}
function fillTerms(type)
{
}