<?php
  require 'conn.php';

  if($_REQUEST['operation'] == 'add_cat')
  {
    $cat = $_REQUEST['cat'];

    $sql = "SELECT * FROM category WHERE description='$cat';";
    $result = mysqli_query($conn, $sql);
    if(mysqli_num_rows($result) > 0)
    {
      echo 0;
    }
    else
    {
      $sql = "INSERT INTO category (description) VALUES ('$cat');";
      if(mysqli_query($conn, $sql))
      {
        echo 1;
      }
      else
      {
        echo 2;
      }
    }
  }

  if($_REQUEST['operation'] == 'add_product')
  {
    $description = $_REQUEST['description'];
    $cat_id = $_REQUEST['cat_id'];
    $subcat_id = $_REQUEST['subcat_id'];
    $cost = $_REQUEST['cost'];
    $qty = $_REQUEST['qty'];

    $sql = "SELECT * FROM products WHERE description='$description';";

    $result = mysqli_query($conn, $sql);
    if(mysqli_num_rows($result) > 0)
    {
      echo 0;
    }
    else
    {
      $sql = "SELECT COUNT(product_id) AS prev_id FROM products;";
      $result = mysqli_query($conn, $sql);

      $prev_id = '';
      while($row = $result->fetch_assoc())
      {
        $prev_id = $row['prev_id'];
      }

      $prev_id = $prev_id + 1;
      $barcode = '60000'.$cat_id.$subcat_id.$prev_id;

      $sql = "INSERT INTO products (description, category, sub_cat, barcode, qty, cost, created) VALUES ('$description', '$cat_id', '$subcat_id', '$barcode', '$qty', '$cost', CURRENT_TIMESTAMP);";
      if(mysqli_query($conn, $sql))
      {
        echo 2;
      }
      else
      {
        echo 1;
      }
    }

  }

  if($_REQUEST['operation'] == 'add_subcat')
  {
    $cat = $_REQUEST['cat'];
    $subcat = $_REQUEST['subcat'];

    $sql = "SELECT * FROM sub_category WHERE description='$subcat' AND cat_id=$cat;";
    $result = mysqli_query($conn, $sql);
    if(mysqli_num_rows($result) > 0)
    {
      echo 0;
    }
    else
    {
      $sql = "INSERT INTO sub_category (cat_id, description) VALUES ('$cat','$subcat');";
      if(mysqli_query($conn, $sql))
      {
        echo 1;
      }
      else
      {
        echo 2;
      }
    }
  }

  if($_REQUEST['operation'] == 'add_user')
  {
    $username = $_REQUEST['username'];
    $password = $_REQUEST['password'];
    $user_name = $_REQUEST['user_name'];
    $user_surname = $_REQUEST['user_surname'];
    $role = $_REQUEST['role'];
    $bno = $_REQUEST['bno'];

    $sql = "SELECT username FROM employees WHERE username='$username';";

    $result = mysqli_query($conn, $sql);

    if(mysqli_num_rows($result) > 0)
    {
      echo '0';
    }
    else
    {
      $sql = "INSERT INTO employees (username, fname, surname, role) VALUES ('$username', '$user_name', '$user_surname', '$role');";

      if(mysqli_query($conn, $sql))
      {
        $sql = "INSERT INTO login (username, password, branch_no) VALUES ('$username', '$password', '$bno')";

        if(mysqli_query($conn, $sql))
        {
          echo '3';
        }
        else
        {
          echo '2';
        }
      }
      else
      {
        echo '1';
      }
    }

  }

  if($_REQUEST['operation'] == 'complete_sale')
  {
    $sale_id = $_REQUEST['sale_id'];
    $product_info = json_decode($_REQUEST['product_info']);
    $tenders = json_decode($_REQUEST['tenders']);

    $sql = "INSERT INTO sales_breakdown (sale_id, product_id) VALUES ";

    foreach ($product_info as $product)
    {
      $sql .= "('$sale_id', '$product->id'),";

      $usql = "UPDATE products SET qty='$product->qty' WHERE product_id='$product->id';";
      mysqli_query($conn, $usql);
    }

    $sql = substr($sql, 0, (strlen($sql) - 1));
    $sql .= ";";

    if(mysqli_query($conn, $sql))
    {
      $sql = "INSERT INTO tender_sale (tender_id, sale_id, cost, paid, returned) VALUES ";
      foreach ($tenders as $tender)
      {
        $sql .= "('$tender->tender_id', '$sale_id', '$tender->cost', '$tender->paid', '$tender->returned'),";
      }

      $sql = substr($sql, 0, (strlen($sql) - 1));
      $sql .= ";";

      if(mysqli_query($conn, $sql))
      {
        echo '2';
      }
      else
      {
        echo '1';
      }
    }
    else
    {
      echo '0';
    }
  }

  if($_REQUEST['operation'] == 'delete_cat')
  {
    $cat_id = $_REQUEST['cat_id'];

    $sql = "SELECT * FROM sub_category WHERE cat_id=$cat_id;";
    $result = mysqli_query($conn, $sql);
    if(mysqli_num_rows($result) > 0)
    {
      echo '0';
    }
    else
    {
      $sql = "DELETE FROM category WHERE cat_id=$cat_id;";
      if(mysqli_query($conn, $sql))
      {
        echo '2';
      }
      else
      {
        echo '1';
      }
    }
  }

  if($_REQUEST['operation'] == 'delete_product')
  {
    $product_id = $_REQUEST['product_id'];

    $sql = "DELETE FROM products WHERE product_id='$product_id';";
    if(mysqli_query($conn, $sql))
    {
      echo '1';
    }
    else {
      echo '0';
    }
  }

  if($_REQUEST['operation'] == 'delete_subcat')
  {
    $subcat_id = $_REQUEST['subcat_id'];

    $sql = "SELECT * FROM products WHERE sub_cat=$subcat_id;";
    $result = mysqli_query($conn, $sql);
    if(mysqli_num_rows($result) > 0)
    {
      echo '0';
    }
    else
    {
      $sql = "DELETE FROM sub_category WHERE subcat_id=$subcat_id;";
      if(mysqli_query($conn, $sql))
      {
        echo '2';
      }
      else
      {
        echo '1';
      }
    }
  }

  if($_REQUEST['operation'] == 'fetch_branches')
  {
    $sql = "SELECT * FROM branches";
    $result = mysqli_query($conn, $sql);
    if(mysqli_num_rows($result) > 0)
    {
      $branch_info = array();
      while($row = $result->fetch_assoc())
      {
        $obj = [
          'branch_no'=>$row['branch_no'],
          'description'=>$row['description']
        ];
        array_push($branch_info, $obj);
      }

      echo json_encode($branch_info);
    }
    else
    {
      echo '0';
    }
  }

  if($_REQUEST['operation'] == 'fetch_cats')
  {
    $sql = "SELECT * FROM category;";
    $result = mysqli_query($conn, $sql);
    if(mysqli_num_rows($result) > 0)
    {
      $cat_info = array();
      while($row = $result->fetch_assoc())
      {
        $obj = [
          'cat_id'=>$row['cat_id'],
          'description'=>$row['description']
        ];
        array_push($cat_info, $obj);
      }
      echo json_encode($cat_info);
    }
    else
    {
      echo 0;
    }
  }

  if($_REQUEST['operation'] == 'fetch_product_info')
  {
    $product_id = $_REQUEST['product_id'];

    $sql = "SELECT product_id, description, category, sub_cat, qty, cost FROM products WHERE product_id=$product_id;";

    $result = mysqli_query($conn, $sql);
    if(mysqli_num_rows($result) > 0)
    {
      $product_info = array();
      while($row = $result->fetch_assoc())
      {
        $obj = [
          'product_id'=>$row['product_id'],
          'description'=>$row['description'],
          'category'=>$row['category'],
          'sub_cat'=>$row['sub_cat'],
          'qty'=>$row['qty'],
          'cost'=>$row['cost']
        ];
        array_push($product_info, $obj);
      }
      echo json_encode($product_info);
    }
    else
    {
      echo 0;
    }
  }

  if($_REQUEST['operation'] == 'fetch_roles')
  {
    $sql = "SELECT id, description FROM roles;";
    $result = mysqli_query($conn, $sql);

    if(mysqli_num_rows($result) > 0)
    {
      $roles = array();
      while($row = $result->fetch_assoc())
      {
        $obj =
        [
          'id'=>$row['id'],
          'description'=>$row['description']
        ];

        array_push($roles, $obj);
      }
      echo json_encode($roles);
    }

  }

  if($_REQUEST['operation'] == 'fetch_subcats')
  {
    $cat = $_REQUEST['cat'];
    $sql = "";

    if($cat == 'Null')
    {
      $sql = "SELECT * FROM sub_category;";
    }
    else {
      $sql = "SELECT * FROM sub_category WHERE cat_id=$cat;";
    }

    $result = mysqli_query($conn, $sql);
    if(mysqli_num_rows($result) > 0)
    {
      $subcat_info = array();
      while($row = $result->fetch_assoc())
      {
        $obj = [
          'subcat_id'=>$row['subcat_id'],
          'cat_id'=>$row['cat_id'],
          'description'=>$row['description']
        ];
        array_push($subcat_info, $obj);
      }
      echo json_encode($subcat_info);
    }
    else
    {
      echo 0;
    }
  }

  if($_REQUEST['operation'] == 'fetch_tenders')
  {
    $sql = "SELECT * FROM tender;";
    $result = mysqli_query($conn, $sql);
    if(mysqli_num_rows($result) > 0)
    {
      $tender = array();
      while($row = $result->fetch_assoc())
      {
        $obj = [
        'id'=>$row['id'],
        'description'=>$row['description']
        ];
        array_push($tender, $obj);
      }
      echo json_encode($tender);
    }
    else
    {
      echo 0;
    }
  }

  if($_REQUEST['operation'] == 'fetch_users')
  {
    $sql = "SELECT 		    a.id, a.username, a.fname, a.surname, b.description
            FROM 		      employees a
            INNER JOIN    roles b
            ON			      a.role = b.id;";

    $result = mysqli_query($conn, $sql);

    if(mysqli_num_rows($result) > 0)
    {
      $users = array();
      while($row = $result->fetch_assoc())
      {
        $obj =
        [
          'id'=>$row['id'],
          'username'=>$row['username'],
          'fname'=>$row['fname'],
          'surname'=>$row['surname'],
          'role'=>$row['description']
        ];
        array_push($users, $obj);
      }
      echo json_encode($users);
    }
    else
    {
      echo '0';
    }
  }

  if($_REQUEST['operation'] == 'fetch_user_info')
  {
    $id = $_REQUEST['user_id'];

    $sql = "SELECT		  a.*, b.fname, b.surname, b.role
            FROM 		    login a
            INNER JOIN	employees b
            ON			    a.username = b.username
            WHERE       b.id = '$id';";

    $result = mysqli_query($conn, $sql);

    if(mysqli_num_rows($result) == 1)
    {
      $user_info = array();
      while($row = $result->fetch_assoc())
      {
        $obj =
        [
          'username'=>$row['username'],
          'password'=>$row['password'],
          'branch_no'=>$row['branch_no'],
          'fname'=>$row['fname'],
          'surname'=>$row['surname'],
          'role'=>$row['role']
        ];

        array_push($user_info, $obj);
      }
      echo json_encode($user_info);
    }

  }

  if($_REQUEST['operation'] == 'filter_products')
  {
    $search = $_REQUEST['search'];
    $cat_id = $_REQUEST['cat_id'];
    $subcat_id = $_REQUEST['subcat_id'];

    $sql = "SELECT * FROM products";

    if($search == 'Null' && $cat_id == 'Null' && $subcat_id == 'Null') // 0 0 0
    {
      $sql = "SELECT * FROM products";
    }
    else if($search == 'Null' && $cat_id != 'Null' && $subcat_id == 'Null') // 0 1 0
    {
      $sql = "SELECT * FROM products WHERE category=$cat_id;";
    }
    else if($search == 'Null' && $cat_id != 'Null' && $subcat_id != 'Null') // 0 1 1
    {
      $sql = "SELECT * FROM products WHERE sub_cat=$subcat_id AND category=$cat_id;";
    }
    else if($search != 'Null' && $cat_id != 'Null' && $subcat_id != 'Null') // 1 1 1
    {
      $sql = "SELECT * FROM products WHERE sub_cat=$subcat_id AND category=$cat_id AND description LIKE '%$search%';";
    }
    else if($search != 'Null' && $cat_id != 'Null' && $subcat_id == 'Null') // 1 1 0
    {
      $sql = "SELECT * FROM products WHERE category=$cat_id AND description LIKE '%$search%';";
    }
    else if($search != 'Null' && $cat_id == 'Null' && $subcat_id == 'Null') // 1 0 0
    {
      $sql = "SELECT * FROM products WHERE description LIKE '%$search%';";
    }

    $result = mysqli_query($conn, $sql);
    if(mysqli_num_rows($result) > 0)
    {
      $products = array();
      while($row = $result->fetch_assoc())
      {
        $obj = [
          'product_id'=>$row['product_id'],
          'description'=>$row['description'],
          'category'=>$row['category'],
          'sub_cat'=>$row['sub_cat'],
          'qty'=>$row['qty'],
          'cost'=>$row['cost'],
          'barcode'=>$row['barcode'],
          'modified'=>$row['modified']
        ];
        array_push($products, $obj);
      }
      echo json_encode($products);
    }
    else
    {
      echo '0';
    }
  }

  if($_REQUEST['operation'] == 'insert_sale')
  {
    $bno = $_REQUEST['bno'];
    $total_cost = $_REQUEST['total_cost'];
    $status = $_REQUEST['status'];

    $sql = "INSERT INTO sale (total_cost, status, branch_no) VALUES ('$total_cost', '$status', '$bno')";

    if(mysqli_query($conn, $sql))
    {
      $sql = "SELECT sale_id FROM sale WHERE branch_no='$bno' ORDER BY sale_ts DESC LIMIT 1";
      $result = mysqli_query($conn, $sql);

      if(mysqli_num_rows($result) == 1)
      {
        $sale_id = "";
        while($row = $result->fetch_assoc())
        {
          $sale_id = $row['sale_id'];

        }
        echo $sale_id;
      }
      else {
        echo 'sum ting wong';
      }

    }
  }

  if($_REQUEST['operation'] == 'login')
  {
    $bno = $_REQUEST['branch'];
    $username = $_REQUEST['username'];
    $pass = $_REQUEST['pass'];

    $sql = "SELECT	b.role
            FROM		login a
            INNER JOIN	employees b
            ON			a.username = b.username
            WHERE		a.username='$username' AND a.password='$pass' AND a.branch_no='$bno';";
    $result = mysqli_query($conn, $sql);
    if(mysqli_num_rows($result) == 1)
    {
      $role = '';
      while($row = $result->fetch_assoc())
      {
        $role = $row['role'];
      }
      echo $role;
    }
    else
    {
      echo 0;
    }
  }

  if($_REQUEST['operation'] == 'modify_cat')
  {
    $cat_id = $_REQUEST['cat_id'];
    $new_description = $_REQUEST['new_description'];

    $sql = "SELECT * FROM category WHERE description='$new_description';";

    $result = mysqli_query($conn, $sql);
    if(mysqli_num_rows($result) > 0)
    {
      echo 0;
    }
    else
    {
      $sql = "UPDATE category SET description='$new_description' WHERE cat_id=$cat_id;";
      if(mysqli_query($conn, $sql))
      {
        echo 2;
      }
      else
      {
        echo 1;
      }
    }
  }

  if($_REQUEST['operation'] == 'modify_product')
  {
    $product_id = $_REQUEST['product_id'];
    $description = $_REQUEST['description'];
    $cat_id = $_REQUEST['cat_id'];
    $subcat_id = $_REQUEST['subcat_id'];
    $cost = $_REQUEST['cost'];
    $qty = $_REQUEST['qty'];

    $barcode = '60000'.$cat_id.$subcat_id.$product_id;

    $sql = "UPDATE products SET description='$description', category='$cat_id', sub_cat='$subcat_id', barcode='$barcode', qty='$qty', cost='$cost', modified=CURRENT_TIMESTAMP WHERE product_id='$product_id';";
    if(mysqli_query($conn, $sql))
    {
      echo '1';
    }
    else
    {
      echo '0';
    }
  }

  if($_REQUEST['operation'] == 'modify_subcat')
  {
    $subcat_id = $_REQUEST['subcat_id'];
    $new_description = $_REQUEST['new_description'];

    $sql = "SELECT * FROM sub_category WHERE description='$new_description';";

    $result = mysqli_query($conn, $sql);
    if(mysqli_num_rows($result) > 0)
    {
      echo 0;
    }
    else
    {
      $sql = "UPDATE sub_category SET description='$new_description' WHERE subcat_id=$subcat_id;";
      if(mysqli_query($conn, $sql))
      {
        echo 2;
      }
      else
      {
        echo 1;
      }
    }
  }

  if($_REQUEST['operation'] == 'product_search')
  {
    $search_txt = $_REQUEST['search_txt'];

    $sql = "SELECT * FROM products WHERE barcode='$search_txt' OR product_id='$search_txt';";
    $result = mysqli_query($conn, $sql);
    if(mysqli_num_rows($result) == 0)
    {
      echo '0';
    }
    else if(mysqli_num_rows($result) > 1)
    {
      echo '1';
    }
    else
    {
      $product_info = array();
      while($row = $result->fetch_assoc())
      {
        $obj = [
          'product_id'=>$row['product_id'],
          'description'=>$row['description'],
          'qty'=>$row['qty'],
          'cost'=>$row['cost'],
          'barcode'=>$row['barcode']
        ];
        array_push($product_info, $obj);
      }
      echo json_encode($product_info);
    }

  }

  if($_REQUEST['operation'] == 'update_user_info')
  {
    $id = $_REQUEST['id'];
    $user_name = $_REQUEST['user_name'];
    $user_surname = $_REQUEST['user_surname'];
    $password = $_REQUEST['password'];
    $role = $_REQUEST['role'];
    $branch = $_REQUEST['branch'];


    $sql = "UPDATE employees SET fname='$user_name', surname='$user_surname', role='$role' WHERE id='$id';";

    if(mysqli_query($conn, $sql))
    {
      $sql = "UPDATE login SET password='$password', branch_no='$branch' WHERE username = (SELECT username FROM employees WHERE id='$id')";

      if(mysqli_query($conn, $sql))
      {
        echo '2';
      }
      else
      {
        echo '1';
      }
    }
    else
    {
      echo '0';
    }

  }

  if($_REQUEST['operation'] == 'delete_user')
  {
    $id = $_REQUEST['id'];

    $sql = "DELETE FROM login WHERE username = (SELECT username FROM employees WHERE id='$id');";

    if(mysqli_query($conn, $sql))
    {
      $sql = "DELETE FROM employees WHERE id='$id';";

      if(mysqli_query($conn, $sql))
      {
        echo '2';
      }
      else
      {
        echo '1';
      }
    }
    else
    {
      echo '0';
    }

  }

// insert into sales_breakdown table
// insert into tender_sale table
// update stock on hand
