var username = '', bno = 0, access = 0;
var sales_arr = [], tender_arr = [], saved_sale = [];
var total = 0;

var number_only = /^-?\d*\.?\d*$/;


$(document).ready(function()
{
  let ud = JSON.parse(sessionStorage.getItem('user_data'));
  username = ud.username;
  bno = ud.bno;
  access = ud.access_level;
  $('.header .message h2 span').text(username);
});

// ====================== NAV BUTTONS ======================//

$(document).on('click', '#btn_open_sale_menu', function()
{

  if($('.options').hasClass('show'))
  {
    $('.options').removeClass('show');
  }
  else
  {
    $('.options').addClass('show');
  }
});

$(document).on('click', '#btn_open_products', function()
{
  if(sales_arr.length > 0)
  {
    if(confirm('There is a sale in Progress. Cancel Sale?'))
    {
      sales_arr = [];

      $('.show').removeClass('show');
      $('.products').addClass('show');
      $('.header > div:not(.message)').css('display', 'none');
      $('.products_btns').css('display', 'flex');

      $('input#product_search').val('');
      $('.products .items table tbody').html('');
      fetch_cats('.header select#category');
      fetch_subcats( '.header select#subcat', $('.header select#category').val());
    }
  }
  else
  {
    $('.show').removeClass('show');
    $('.products').addClass('show');
    $('.header > div:not(.message)').css('display', 'none');
    $('.products_btns').css('display', 'flex');

    $('input#product_search').val('');
    $('.products .items table tbody').html('');
    fetch_cats('.header select#category');
    fetch_subcats( '.header select#subcat', $('.header select#category').val());
  }
});

$(document).on('click', '#btn_open_users', function()
{
  if(access > 2)
  {
    showAlert('You Do Not Have Access To This Feature.', 2);
  }
  else
  {
    if(sales_arr.length > 0)
    {
      if(confirm('There is a sale in Progress. Cancel Sale?'))
      {
        sales_arr = [];

        $('.show').removeClass('show');
        $('.users').addClass('show');
        $('.header > div:not(.message)').css('display', 'none');
        $('.user_btns').css('display', 'flex');
        fetch_users();
      }
    }
    else
    {
      $('.show').removeClass('show');
      $('.users').addClass('show');
      $('.header > div:not(.message)').css('display', 'none');
      $('.user_btns').css('display', 'flex');
      fetch_users();
    }
  }
});

$(document).on('click', '#btn_log_out', function()
{
  sessionStorage.removeItem('user_data');
  window.location.href="index.html";
});

// ====================== Sale Subset BUTTONS ======================//
$(document).on('click', '#btn_start_sale', function()
{

  if(sales_arr.length > 0)
  {
    if(confirm('There is a sale in Progress. Cancel Sale?'))
    {
      sales_arr = [];
    }
  }

  display_sales();
  $('.options').removeClass('show');
  $('.sales').addClass('show');
  $('.header > div:not(.message)').css('display', 'none');
  $('.sales_btns').css('display', 'flex');
});

$(document).on('click', '#btn_resume_sale', function()
{
  console.log('fuck');
  if(saved_sale.length < 1)
  {
    showAlert('No Suspended Sale Found', 2);
  }
  else
  {
    sales_arr = saved_sale;
    saved_sale = [];
    display_sales();
  }
});

// ====================== SALES HEADER ======================//
$(document).on('keypress', 'input#search_txt', function(e)
{
  if(e.key == 'Enter')
  {
    $('#btn_product_search').click();
  }
});

$(document).on('click', '#btn_product_search', function()
{

  let search_txt = $('input#search_txt').val();

  if(search_txt.trim() == '')
  {
    showAlert('Enter a Barcode/ID', 2);
    add_err('input#search_txt');
  }
  else
  {
    $.post('assets/php/index.php',
    {
      'operation': 'product_search',
      'search_txt': search_txt
    },
    function(response)
    {
      if(response == '0')
      {
        showAlert('No Product Found', 2);
      }
      else if(response == '1')
      {
        showAlert('Refine Search', 2);
      }
      else
      {
        let product_info = JSON.parse(response);
        build_sales_obj(product_info[0]);
        display_sales();
        $('input#search_txt').val('');
        $('input#search_txt').focus();
      }
    });
  }

});

// ====================== SALES OPERATIONS ======================//
$(document).on('click', '#btn_checkout', function()
{
  tender_arr = [];
  load_checkout();
});

$(document).on('click', '#btn_save', function()
{
  if(saved_sale.length > 0)
  {
    showAlert('There is already a Suspended Sale', 2);
  }
  else
  {
    if(sales_arr.length < 1)
    {
      showAlert('Nothing to Save', 2);
    }
    else
    {
      saved_sale = sales_arr;
      sales_arr = [];
      tender_arr = [];
      $('.sales .items table tbody').html('');
      $('.sales .operations .total p span').html('0');

      showAlert('Sale Saved for a Later Time', 1);
    }
  }
});

$(document).on('click', '#btn_cancel', function()
{
  if(sales_arr.length < 1)
  {
    showAlert('No Sale To Cancel', 2);
  }
  else
  {
    let ask = confirm('Cancel Sale?');

    if(ask)
    {
      sales_arr = [];
      tender_arr = [];
      display_sales();
    }
  }
});

// ====================== MANAGE PRODUCTS BUTTONS ======================//
$(document).on('click', '#btn_filter', function()
{
  let search = $('.products_btns input#product_search').val();
  let cat_id = $('.products_btns select#category').val();
  let subcat_id = $('.products_btns select#subcat').val();

  $.post('assets/php/index.php',
  {
    'operation': 'filter_products',
    'search': search.trim() == '' ? 'Null' : search,
    'cat_id': cat_id == '0' ? 'Null' : cat_id,
    'subcat_id': subcat_id == '0' ? 'Null' : subcat_id
  },
  function(response)
  {
    if(response == 0)
    {
      showAlert('No Products Found', 2);
    }
    else
    {
      let products = JSON.parse(response);
      $('.products .items table tbody').html('');
      products.forEach((product) =>
      {
        let date = new Date(product.modified);

        $('.products .items table tbody').append(
          `
          <tr>
            <td>${product.product_id}</td>
            <td>${product.description}</td>
            <td>R${product.cost}</td>
            <td>${product.qty}</td>
            <td>${product.barcode}</td>
            <td>${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}</td>
            <td data-product-id="${product.product_id}" id="btn_edit_product" title="Edit Product"><i class="fas fa-pen"></i></td>
            <td data-product-id="${product.product_id}" id="btn_delete_product" title="Delete Product"><i class="fas fa-times-circle"></i></td>
          </tr>
          `);
      });

    }
  });
});

$(document).on('click', '.btn_manage_cats', function()
{

  if(access > 2)
  {
    showAlert('You Do Not Have Access To This Feature.', 2);
  }
  else
  {
    $('.modal.cats_management').css('display', 'flex');
    fetch_cats('#del_cat , #add_subcat_cat, #mod_cat_cat');
    fetch_subcats('#del_subcat, #mod_subcat');
  }
});

$(document).on('click', '.btn_add_product', function()
{
  if(access > 2)
  {
    showAlert('You Do Not Have Access To This Feature.', 2);
  }
  else
  {
    $('.modal.product_add').css('display', 'flex');
    fetch_cats('select#add_product_cat');
  }
});

$(document).on('click', '#btn_delete_product', function()
{
  if(access > 2)
  {
    showAlert('You Do Not Have Access To This Feature.', 2);
  }
  else
  {
    let id = $(this).data('product-id');
    delete_product(id);
  }
});

$(document).on('click', 'button.add_cat', function()
{
  add_cat();
});

$(document).on('click', 'button.add_subcat', function()
{
  add_subcat();
});

$(document).on('click', 'button.add_product', function()
{
  add_product();
});

$(document).on('click', 'button.delete_cat', function()
{
  delete_cat();
});

$(document).on('click', 'button.delete_subcat', function()
{
  delete_subcat();
});

$(document).on('click', 'button.modify_cat', function()
{
  modify_cat();
});

$(document).on('click', 'button.modify_subcat', function()
{
  modify_subcat();
});

$(document).on('click', 'button.modify_product', function()
{
  let id = $(this).data('id');
  console.log(id);
  modify_product(id);
});

$(document).on('click','#btn_edit_product', function()
{
  let product_id = $(this).closest('td').data('product-id');
  fetch_product_info(product_id);
});

$(document).on('click','.content, .header',function()
{
  if($('.options').hasClass('show'))
  {
    $('.options').removeClass('show');
  }
});

$(document).on('click', '.modal .card .card_header i.fa-times-circle', function()
{
  $(this).closest('.modal').css('display', 'none');
});

$(document).on('click', '.product_edit button.modify_product', function()
{

});

$(document).on('change', '.header select#category', function()
{
  let cat_id = $('.header select#category').val();
  fetch_subcats('.header select#subcat', cat_id);
});

$(document).on('change', 'select#mod_cat_cat', function()
{
  let elem = document.querySelector('select#mod_cat_cat');
  $('input#mod_cat').val(elem.options[elem.selectedIndex].text);
});

$(document).on('change', 'select#mod_subcat', function()
{
  let elem = document.querySelector('select#mod_subcat');
  $('input#mod_sub').val(elem.options[elem.selectedIndex].text);
});

$(document).on('change', 'select#add_product_cat', function()
{
  let cat_id = $('.product_add select#add_product_cat').val();
  fetch_subcats('.product_add select#add_product_subcat', cat_id);
});

$(document).on('change','.product_edit select#add_product_cat', function()
{
  let id = $('.product_edit select#add_product_cat').val();
  fetch_subcats('.product_edit select#add_product_subcat',id);
});

$(document).on('click', '.sales .items i.fas.fa-plus', function()
{
  let idx = $(this).closest('tr').data('sale-idx');

  if(sales_arr[idx].qty - (sales_arr[idx].sale_qty + 1) >= 0)
  {
    sales_arr[idx].sale_qty += 1;
    display_sales();
  }

});

$(document).on('click', '.sales .items i.fas.fa-minus', function()
{
  let idx = $(this).closest('tr').data('sale-idx');

  if(sales_arr[idx].sale_qty - 1 > 0)
  {
    sales_arr[idx].sale_qty -= 1;
    display_sales();
  }
});

$(document).on('click', '.sales .items i.fas.fa-times-circle', function()
{
  let del = confirm("Delete Line ?");

  if(del)
  {
    let idx = $(this).closest('tr').data('sale-idx');
    sales_arr.splice(idx, 1);
    display_sales();
  }
});

$(document).on('change', 'select#tender', function()
{
  let tender = $('select#tender').val();

  if(tender == 2)
  {
    $('input#amount').val($('input#cost').val().split('R')[1]);
    $('input#amount').attr('disabled', true);
  }
  else
  {
    $('input#amount').val('');
    $('input#amount').attr('disabled', false);

  }
});

$(document).on('click', '#btn_back', function()
{
  $('.modal.checkout').css('display', 'none');
});

$(document).on('click', '#btn_proceed', function()
{
  checkout();
});

// ====================== USER BUTTONS ======================//

$(document).on('click', '#btn_open_add_user_modal', function()
{
  fetch_roles('.modal.user_add select#role');
  fetch_branches('select#branches');
  $('.modal.user_add').css('display', 'flex');
});

$(document).on('click', '.modal.user_add #btn_add_user', function()
{
  add_user();
});

$(document).on('click', 'i#edit_user', function()
{
  let id = parseInt($(this).closest('tr').data('uid'));


  fetch_roles('.modal.user_edit select#role');
  fetch_branches('.modal.user_edit select#branch');
  fetch_user_info(id);
  $('.modal.user_edit').css('display', 'flex');
});

// ====================== USER BUTTONS ======================//

$(document).on('click', '#btn_save_user_info', function()
{
  let user_name = $('.modal.user_edit #user_name').val();
  let user_surname = $('.modal.user_edit #user_surname').val();
  let password = $('.modal.user_edit #password').val();
  let role = $('.modal.user_edit #role').val();
  let branch = $('.modal.user_edit #branch').val();
  let id = parseInt($('.modal.user_edit .card_header h2').data('uid'));

  if(user_name.trim() == '')
  {
    showAlert('Cannot Leave Field Blank', 2);
    add_err('.modal.user_edit #user_name');
  }
  else
  {
    if(user_surname.trim() == '')
    {
      showAlert('Cannot Leave Field Blank', 2);
    add_err('.modal.user_edit #user_surname');
    }
    else
    {
      if(password.trim() == '')
      {
        showAlert('Cannot Leave Field Blank', 2);
        add_err('.modal.user_edit #password');
      }
      else
      {
        if(role == '0')
        {
          showAlert('Please Select a Role for User', 2);
          add_err('.modal.user_edit #role');
        }
        else
        {
          if(branch == '0')
          {
            showAlert('Please Select Branch', 2);
            add_err('.modal.user_edit #branch');
          }
          else
          {
            $.post('assets/php/index.php',
            {
              'operation': 'update_user_info',
              'id': id,
              'user_name': user_name,
              'user_surname': user_surname,
              'password': password,
              'role': role,
              'branch': branch

            },function(response)
            {
              if(response != '2')
              {
                showAlert(`Sum Ting Wong - ${response}`, 2);
              }
              else
              {
                showAlert('Update Successfull', 1);
              }
            });
          }
        }
      }
    }
  }
});

$(document).on('click', '.users table#users i#delete', function()
{
  if(confirm('Are you Sure you Want to Delete?'))
  {
    let id = parseInt($(this).closest('tr').data('uid'));

    $.post('assets/php/index.php',
    {
      'operation': 'delete_user',
      'id': id
    },
    function(response)
    {
      if(response == '2')
      {
        showAlert('User Deleted', 1);
        fetch_users();
      }
      else
      {
        showAlert(`Sum Ting Wong - ${response}`, 2);
      }
    });
  }
});



function add_cat()
{
  let cat = $('input#add_cat').val();
  if(cat.trim() == '')
  {
    add_err('input#add_cat');
    showAlert('Cannot Leave Field Blank', 2);
  }
  else
  {
    $.post('assets/php/index.php',
    {
      'operation': 'add_cat',
      'cat': cat
    },
    function(response)
    {
      if(response == 0)
      {
        showAlert('Category Already Exists', 2);
      }
      else if(response == 1)
      {
        showAlert('Category Created Successfully', 1);
      }
      else if(response == 2)
      {
        showAlert('Something Went Wrong', 2);
      }
    });
  }
}

function add_subcat()
{
  let cat = $('select#add_subcat_cat').val();
  let subcat = $('input#add_subcat').val();
  if(cat == '0')
  {
    add_err('select#add_subcat_cat');
    showAlert('Choose A Category', 2);
  }
  else
  {
    if(subcat.trim() == '')
    {
      add_err('input#add_subcat');
      showAlert('Cannot Leave Field Blank', 2);
    }
    else
    {
      $.post('assets/php/index.php',
      {
        'operation': 'add_subcat',
        'cat': cat,
        'subcat': subcat
      },
      function(response)
      {
        if(response == 0)
        {
          showAlert('Sub-category Already Exists', 2);
        }
        else if(response == 1)
        {
          showAlert('Sub-category Created Successfully', 1);
        }
        else if(response == 2)
        {
          showAlert('Something Went Wrong', 2);
        }
      });
    }
  }
}

function add_product()
{
  let description = $('input#description').val();
  let cat_id = $('select#add_product_cat').val();
  let subcat_id = $('select#add_product_subcat').val();
  let cost = $('input#cost').val();
  let qty = $('input#qty').val();

  if(description.trim() == '')
  {
    showAlert('Cannot Leave Field Blank', 2);
    add_err('input#description');
  }
  else if(description.trim().length > 50)
  {
    showAlert('Description Exceeds 50 characters', 2);
    add_err('input#description');
  }
  else
  {
    if(cat_id == '0')
    {
      showAlert('Choose a Category', 2);
      add_err('select#add_product_cat');
    }
    else
    {
      if(subcat_id == '0')
      {
        showAlert('Choose a Category', 2);
        add_err('select#add_product_subcat');
      }
      else
      {
        if(!((/^-?\d*\.?\d*$/).test(cost)) || cost.trim() == '')
        {
          showAlert('Only Numeric Value Allowed', 2);
          add_err('input#cost');
        }
        else
        {
          if(!((/^[0-9]+$/).test(qty)) || qty.trim() == '')
          {
            showAlert('Only Numeric Value Allowed', 2);
            add_err('input#qty');
          }
          else
          {
            $.post('assets/php/index.php',
            {
              'operation': 'add_product',
              'description': description,
              'cat_id': parseInt(cat_id),
              'subcat_id': parseInt(subcat_id),
              'cost': parseFloat(cost),
              'qty': parseInt(qty)
            },
            function(response)
            {
              if(response == 0)
              {
                showAlert('Product Already Exists', 2);
              }
              else if(response == 1)
              {
                showAlert('Something Went Wrong', 2);
                console.log(response);
              }
              else if(response == 2)
              {
                showAlert('Product Created', 1);
              }
            });
          }
        }
      }
    }
  }
}

function add_user()
{
  let n_username = $('.modal.user_add #username').val();
  let password = $('.modal.user_add #password').val();
  let user_name = $('.modal.user_add #user_name').val();
  let user_surname = $('.modal.user_add #user_surname').val();
  let role = $('.modal.user_add select#role').val();
  let branch = $('.modal.user_add select#branches').val();

  if(n_username.trim() == '')
  {
    showAlert('Do not Leave Blank Fields', 2);
    add_err('.modal.user_add #username');
  }
  else
  {
    if(password.trim() == '')
    {
      showAlert('Do not Leave Blank Fields', 2);
      add_err('.modal.user_add #password');
    }
    else
    {
      if(user_name.trim() == '')
      {
        showAlert('Do not Leave Blank Fields', 2);
        add_err('.modal.user_add #user_name');
      }
      else
      {
        if(user_surname.trim() == '')
        {
          showAlert('Do not Leave Blank Fields', 2);
          add_err('.modal.user_add #user_surname');
        }
        else
        {
          if(role == '0')
          {
            showAlert('Do not Leave Blank Fields', 2);
            add_err('.modal.user_add #role');
          }
          else
          {
            if(branch == 0)
            {
              showAlert('Do not Leave Blank Fields', 2);
              add_err('.modal.user_add #branches');
            }
            else
            {
              $.post('assets/php/index.php',
              {
                'operation': 'add_user',
                'username': n_username,
                'password': password,
                'user_name': user_name,
                'user_surname': user_surname,
                'role': role,
                'bno': branch
              },
              function(response)
              {
                if(response == '0')
                {
                  showAlert('Username is Taken', 2);
                }
                else if(response == '3')
                {
                  showAlert('User Added', 1);
                  $('.modal.user_add input').val('');
                  fetch_users();
                  clear_fields(['.modal.user_add #username', '.modal.user_add #password', '.modal.user_add #user_name', '.modal.user_add #user_surname', '.modal.user_add select#role', '.modal.user_add select#branches']);
                }
                else
                {
                  showAlert(`Something Went Wrong - err#${response}`, 2);
                }
              });
            }
          }
        }
      }
    }
  }

}

function delete_cat()
{
  let cat_id = $('select#del_cat').val();
  if(cat_id == '0')
  {
    showAlert('Please Choose a category',2);
    add_err('select#del_cat');
  }
  else
  {
    $.post('assets/php/index.php',
    {
      'operation': 'delete_cat',
      'cat_id': cat_id
    },
    function(response)
    {
      if(response == '0')
      {
        showAlert('There Are Sub-categories Linked to this Category. Cannot Delete', 2);
      }
      else if(response == '1')
      {
        showAlert('Something Went Wrong', 2);
      }
      else if(response == '2')
      {
        showAlert('Category Deleted', 1);
      }
    });
  }
}

function delete_subcat()
{
  let subcat_id = $('select#del_subcat').val();
  if(subcat_id == '0')
  {
    showAlert('Please Choose a category',2);
    add_err('select#del_subcat');
  }
  else
  {
    $.post('assets/php/index.php',
    {
      'operation': 'delete_subcat',
      'subcat_id': subcat_id
    },
    function(response)
    {
      if(response == '0')
      {
        showAlert('There Are Products Linked to this Sub-category. Cannot Delete', 2);
      }
      else if(response == '1')
      {
        showAlert('Something Went Wrong', 2);
      }
      else if(response == '2')
      {
        showAlert('Category Deleted', 1);
      }
    });
  }

}

function delete_product(product_id)
{
  let ans = confirm("Are you Sure You Want to Delete This Product?");

  if(ans)
  {
    $.post('assets/php/index.php',
    {
      'operation': 'delete_product',
      'product_id': product_id
    },
    function(response)
    {
      if(response == 0)
      {
        showAlert('Something Went Wrong', 2);
        console.log(response);
      }
      else if(response == 1)
      {
        showAlert('Product Deleted', 1);
        $('#btn_filter').click();
      }
    });
  }
}

function fetch_branches(elem)
{
  console.log('awe');
  $.post('assets/php/index.php',
  {
    'operation': 'fetch_branches'
  },
  function(response)
  {
    if(response == 0)
    {
      showAlert('No Branches Found', 2);
    }
    else
    {
      let branches = JSON.parse(response);
      console.log(branches);
      $(elem).html('<option value="0">Select Branch</option');
      branches.forEach(branch =>
        {
          $(elem).append(
            `
            <option value="${branch.branch_no}">${branch.description}</option>
            `);
        });
    }
  });
}

function fetch_roles(elem)
{
  $.post('assets/php/index.php',
  {
    'operation': 'fetch_roles'
  },
  function(response)
  {
    $(elem).html('<option value="0">Choose Role</option>');
    let roles = JSON.parse(response);

    roles.forEach(role =>
    {
      $(elem).append(
        `
          <option value="${role.id}">${role.description}</option>
        `);
    });

  });
}

function fetch_users()
{
  $.post('assets/php/index.php',
  {
    'operation': 'fetch_users'
  },
  function(response)
  {
    $('table#users tbody').html('');
    if(response == 0)
    {
      $('table#users tbody').html('<tr style="background: red;"><td colspan="5">No Users</t></tr>');
      showAlert('No Users Found', 2);
    }
    else
    {
      let users = JSON.parse(response);

      users.forEach((user) =>
      {
        $('table#users tbody').append(
          `
          <tr data-uid="${user.id}">
            <td>${user.fname}</td>
            <td>${user.surname}</td>
            <td>${user.role}</td>
            <td><i class="fas fa-pen" id="edit_user"></i></td>
            <td><i class="fas fa-times-circle" id="delete" style="${user.username == username ? "display: none" : "display: block"}"></i></td>
          </tr>
          `);
      });

    }
  });
}

function fetch_user_info(id)
{
  $.post('assets/php/index.php',
  {
    'operation': 'fetch_user_info',
    'user_id': id
  },
  function(response)
  {
    if(response == 0)
    {
      showAlert(`Sum Ting Wong - ${response}`, 2);
    }
    else
    {
      let user_info = JSON.parse(response);
      console.log(user_info[0]);
      $('.modal.user_edit #user_name').val(user_info[0].fname);
      $('.modal.user_edit #user_surname').val(user_info[0].surname);
      $('.modal.user_edit #password').val(user_info[0].password);
      $('.modal.user_edit #role').val(user_info[0].role);
      $('.modal.user_edit #branch').val(user_info[0].branch_no);
      $('.modal.user_edit .card_header').html(
        `
        <h2 data-uid="${id}">${user_info[0].username}</h2>
        <i class="fas fa-times-circle"></i>
        `);
    }
  });
}

function modify_cat()
{
  let cat_id = $('select#mod_cat_cat').val();
  let new_description = $('input#mod_cat').val();

  let elem = document.querySelector('select#mod_cat_cat');
  let old_description = elem.options[elem.selectedIndex].text;

  if(new_description.trim() == '')
  {
    showAlert('Cannot Leave Field Empty', 2);
    add_err('input#mod_cat');
  }
  else if(new_description.trim() == old_description)
  {
    showAlert('No Changes Were Made', 2);
  }
  else
  {
    $.post('assets/php/index.php',
    {
      'operation': 'modify_cat',
      'cat_id': cat_id,
      'new_description': new_description
    },
    function(response)
    {
      if(response == 0)
      {
        showAlert('Category Already Exists', 2);
      }
      else if(response == 1)
      {
        showAlert('Something Went Wrong',2);
        console.log(response);
      }
      else if(response == 2)
      {
        showAlert('Category Updated', 1);
      }
    });
  }
}

function modify_subcat()
{
  let subcat_id = $('select#mod_subcat').val();
  let new_description = $('input#mod_sub').val();

  let elem = document.querySelector('select#mod_subcat');
  let old_description = elem.options[elem.selectedIndex].text;

  if(new_description.trim() == '')
  {
    showAlert('Cannot Leave Field Empty', 2);
    add_err('input#mod_sub');
  }
  else if(new_description.trim() == old_description)
  {
    showAlert('No Changes Were Made', 2);
  }
  else
  {
    $.post('assets/php/index.php',
    {
      'operation': 'modify_subcat',
      'subcat_id': subcat_id,
      'new_description': new_description
    },
    function(response)
    {
      if(response == 0)
      {
        showAlert('Sub-category Already Exists', 2);
      }
      else if(response == 1)
      {
        showAlert('Something Went Wrong',2);
        console.log(response);
      }
      else if(response == 2)
      {
        showAlert('Sub-category Updated', 1);
      }
    });
  }
}

function modify_product(product_id)
{
  let description = $('.product_edit input#description').val();
  let cat_id = $('.product_edit select#add_product_cat').val();
  let subcat_id = $('.product_edit select#add_product_subcat').val();
  let cost = $('.product_edit input#cost').val();
  let qty = $('.product_edit input#qty').val();

  if(description.trim() == '')
  {
    showAlert('Cannot Leave Field Blank', 2);
    add_err('input#description');
  }
  else if(description.trim().length > 50)
  {
    showAlert('Description Exceeds 50 characters', 2);
    add_err('input#description');
  }
  else
  {
    if(cat_id == '0')
    {
      showAlert('Choose a Category', 2);
      add_err('select#add_product_cat');
    }
    else
    {
      if(subcat_id == '0')
      {
        showAlert('Choose a Category', 2);
        add_err('select#add_product_subcat');
      }
      else
      {
        if(!((/^-?\d*\.?\d*$/).test(cost)) || cost.trim() == '')
        {
          showAlert('Only Numeric Value Allowed', 2);
          add_err('input#cost');
        }
        else
        {
          if(!((/^[0-9]+$/).test(qty)) || qty.trim() == '')
          {
            showAlert('Only Numeric Value Allowed', 2);
            add_err('input#qty');
          }
          else
          {
            $.post('assets/php/index.php',
            {
              'operation': 'modify_product',
              'product_id': product_id,
              'description': description,
              'cat_id': parseInt(cat_id),
              'subcat_id': parseInt(subcat_id),
              'cost': parseFloat(cost),
              'qty': parseInt(qty)
            },
            function(response)
            {
              console.log(product_id);
              console.log(response);

              if(response == '0')
              {
                showAlert('Something Went Wrong', 2);
              }
              else if(response == '1')
              {
                showAlert('Product Updated', 1);
                $('.modal.product_edit').css('display', 'none');
                $('#btn_filter').click();
              }
            });
          }
        }
      }
    }
  }
}

function fetch_cats(elem)
{
  $.post('assets/php/index.php',
  {
    'operation': 'fetch_cats'
  },
  function(response)
  {
    if(response == 0)
    {
      $(elem).html(`<option value="0"> --No Categories Listed--</option>`);
    }
    else
    {
      $(elem).html('<option value="0"> Choose Category</option>');
      let cats = JSON.parse(response);
      cats.forEach(cat =>
      {
        $(elem).append(`<option value="${cat.cat_id}">${cat.description}</option>`)
      });
    }
  });
}

function fetch_subcats(elem, cat)
{
  cat = cat ? cat : 'Null';

  $.post('assets/php/index.php',
  {
    'operation': 'fetch_subcats',
    'cat': cat
  },
  function(response)
  {
    if(response == 0)
    {
      $(elem).html(`<option value="0"> No sub-categories</option>`);
    }
    else
    {
      $(elem).html('<option value="0"> Choose sub-category</option>');
      let subcats = JSON.parse(response);
      subcats.forEach(subcat =>
      {
        $(elem).append(`<option value="${subcat.subcat_id}">${subcat.description}</option>`)
      });
    }
  });
}

function fetch_product_info(id)
{
  $.post('assets/php/index.php',
  {
    'operation': 'fetch_product_info',
    'product_id': id
  },
  function(response)
  {
    if(response == 0)
    {
      showAlert('Something Went Wrong', 2);
    }
    else
    {
      let product = JSON.parse(response);
      fetch_cats('.product_edit select#add_product_cat');
      fetch_subcats('.product_edit select#add_product_subcat', product[0].category);

      $('.product_edit input#description').val(product[0].description);
      $('.product_edit select#add_product_cat').val(`'${product[0].category}'`);
      $('.product_edit select#add_product_subcat').val(`'${product[0].sub_cat}'`);
      $('.product_edit input#cost').val(product[0].cost);
      $('.product_edit input#qty').val(product[0].qty);
      $('.product_edit button.modify_product').data('id', id);
      $('.modal.product_edit').css('display', 'flex');
      console.log(product[0]);
    }
  });
}

function fetch_tenders(elem)
{

  $.post('assets/php/index.php',
  {
    'operation': 'fetch_tenders'
  },
  function(response)
  {
    if(response == 0)
    {
      console.log(response);
    }
    else
    {
      $(elem).html('<option value="0">Select Tender</option>');

      let tenders = JSON.parse(response);
      tenders.forEach(tender =>
      {
        $(elem).append(
          `
            <option value="${tender.id}">${tender.description}</option>
          `);
      });
    }
  });

  return tender;
}

function add_err(elm)
{
  $(elm).addClass('err');
  setTimeout(function()
  {
    $(elm).removeClass('err');
  },3000);
}

function build_sales_obj(product_info)
{
  if(sales_arr.length < 1)
  {
    product_info.sale_qty = 1;

    if(product_info.qty - product_info.sale_qty >= 0)
    {
      sales_arr.push(product_info);
    }
    else
    {
      showAlert('Insuffiecient Stock', 2);
    }
  }
  else
  {
    let sale_idx = sales_arr.findIndex(index => index.product_id == product_info.product_id);

    if(sale_idx >= 0)
    {
      if(sales_arr[sale_idx].qty - sales_arr[sale_idx].sale_qty - 1 >= 0)
      {
        sales_arr[sale_idx].sale_qty = sales_arr[sale_idx].sale_qty + 1;
      }
      else
      {
        showAlert('Insuffiecient Stock', 2);
      }
    }
    else
    {
      product_info.sale_qty = 1;

      if(product_info.qty - product_info.sale_qty >= 0)
      {
        sales_arr.push(product_info);
      }
      else
      {
        showAlert('Insuffiecient Stock', 2);
      }
    }
  }

}

function display_sales()
{
  let total = 0;
  $('.sales .items table tbody').html('');
  sales_arr.forEach((line, idx) =>
  {
    total += line.sale_qty * line.cost;
    $('.sales .items table tbody').append(
      `
        <tr data-sale-idx="${idx}">
          <td>${line.description}</td>
          <td>${line.sale_qty} @</td>
          <td>${line.cost}</td>
          <td>${line.sale_qty * line.cost}</td>
          <td title="Increase Quantity"><i class="fas fa-plus"></i></td>
          <td title="Reduce Quantity"><i class="fas fa-minus"></i></td>
          <td title="Delete Line"><i class="fas fa-times-circle"></i></td>
          </td>
        </tr>
      `);
  });

  $('.sales .operations .total p span').html(total);
}

function load_checkout()
{
  if(sales_arr.length == 0)
  {
    showAlert('No Items Available to Checkout', 2);
  }
  else
  {
    total = 0;

    sales_arr.forEach(line =>
    {
      total += line.sale_qty * line.cost;
    });

    fetch_tenders('.modal.checkout select#tender');
    $('input#cost').val(`Total: R${total}`);
    $('.modal.checkout').css('display', 'flex');
  }
}

function checkout()
{
  if($('select#tender').val() == 0)
  {
    showAlert('Select Tender', 2);
    add_err('select#tender');
  }
  else
  {
    let amount = $('input#amount').val();

    if(!number_only.test(amount) || amount.trim() == '')
    {
      showAlert('Enter a Valid Amount', 2);
      add_err('input#amount');
    }
    else
    {
      amount = parseFloat(amount);
      let tender_id = $('select#tender').val();

      if(tender_arr.length == 0)
      {
        let tender_onj =
        {
          'tender_id': tender_id,
          'cost': total,
          'paid': amount,
          'returned': amount <= total ? 0 : (amount-total)
        };
        tender_arr.push(tender_onj);
      }
      else
      {
        let tender_idx = tender_arr.findIndex(index => index.tender_id == tender_id);

        if(tender_idx < 0)
        {
          let tender_onj =
          {
            'tender_id': tender_id,
            'cost': total,
            'paid': amount,
            'returned': amount <= total ? 0 : (amount-total)
          };
          tender_arr.push(tender_onj);
        }
        else
        {
          tender_arr[tender_idx].paid += amount;
          tender_arr[tender_idx].returned = amount <= total ? 0 : (amount-total);
        }
      }

      if(total > amount)
      {
        total = total - amount;
      }
      else
      {
        total = 0;
        complete_checkout();
      }
      $('input#cost').val(`Total: R${total}`);
      $('input#amount').val('')
    }
  }
}

function complete_checkout()
{
  $('.modal.checkout').css('display', 'none');
  total = 0;

  sales_arr.forEach(line =>
  {
    total += line.sale_qty * line.cost;
  });

  $.post('assets/php/index.php',
  {
    'operation': 'insert_sale',
    'total_cost': total,
    'status': 'c',
    'bno': bno
  },
  function(response)
  {
    if(response == 'sum ting wong')
    {
      showAlert(response, 2);
      console.log(response);
    }
    else
    {
      showAlert('Shit Worked', 1);

      let product_info = [];

      sales_arr.forEach((line) =>
      {
        product_info.push(
          {
            'id': line.product_id,
            'qty': line.qty - line.sale_qty
          });
      });

      $.post('assets/php/index.php',
      {
        'operation': 'complete_sale',
        'sale_id': response,
        'product_info': JSON.stringify(product_info),
        'tenders': JSON.stringify(tender_arr)
      },
      function(response)
      {
        if(response == '2')
        {
          showAlert("Sale Completed", 1);
          sales_arr = [];
          tender_arr = [];
          $('.sales .items table tbody').html('');
          $('.sales .operations .total p span').html('0');

        }
        else
        {
          console.log(`Sum Ting Wong - ${response}`, 2);
        }
      });
    }
  });
}

function clear_fields(inputs)
{
  inputs.forEach(input =>
  {
    if(input.includes('select'))
    {
      $(input).val('0');
    }
    else
    {
      $(input).val('');
    }
  });
}
