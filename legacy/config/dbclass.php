<?php
class db
{

    protected $dbh              = null;
    protected $query            = null;
    protected $timestamp_writes = false;
    protected $prefix           = null;
    protected $sql_sm           = null;

    /**
     * Db constructor.
     * Connection to the Database
     *
     * @param string $driver
     * @param string $host
     * @param string $user
     * @param string $pass
     * @param string $name
     * @param string $charset
     * @param null   $prefix
     */

    public function __construct($driver = 'mysql', $host = '192.168.1.200', $user = 'my_root', $pass = 'my@123456', $name = 'zigfly_erp', $charset = 'utf8', $prefix = null)
    {

        $dsn = $driver . ':host=' . $host;

        if (!empty($name))
        {
            $dsn .= ';dbname=' . $name;
        }
        else
        {
            return "Please Select Database Name";
            exit();
        }

        if (!empty($prefix))
        {
            $this->prefix = $prefix;
        }

        $dsn .= ';charset=' . $charset;

        try
        {
            $this->dbh = new \PDO($dsn, $user, $pass, [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION, \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC]);
        }
        catch(\PDOException $e)
        {
            error_log($e);

            return false;
        }
    }

    /**
     * @param string $sql
     *
     * @return bool
     */
    public function execute($sql)
    {
        $sth = $this
            ->dbh
            ->prepare($sql);

        if ($res = $sth->execute())
        {
            return $this->return_fun($this
                ->sth->queryString, $res, 1,$this->sth);
        }
        else
        {
            return $this->return_fun($this
                ->sth->queryString, false, 0, $this
                ->sth
                ->errorInfo);
        }
    }

    /**
	 * @param string $query
	 * @param array  $params
	 *
	 * @return array
	 */
	public function query($query, $params = [])
	{
		$this->query = $this->dbh->prepare($query);
		if (empty($params))
		{
			$res = $this->query->execute();
		}
		else
		{
			$res = $this->query->execute($params);
		}
		if ($res !== false)
		{
            $res = $this->query->fetchAll();

            if ($res) {
                return $this->return_fun($this
                    ->query->queryString, $res, 1,$this->query);
            } else {
                return $this->return_fun($this
                    ->query->queryString, $res, 1,$this->query);
            }
		}

		return [];
	}

	/**
	 * @param $database
	 *
	 * @return bool
	 */
	public function useDatabase($database)
	{
		$sql_str     = 'USE ' . $database;
		$this->query = $this->dbh->prepare($sql_str);

        $res =  $this->query->execute();
        return $this->return_fun($this
                    ->query->queryString, $res, 1,$this->query);
	}

	/**
	 * @param $database
	 *
	 * @return bool
	 */
	public function createDatabase($database)
	{
		$sql_str     = 'CREATE DATABASE IF NOT EXISTS ' . $database . ' DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;';
		$this->query = $this->dbh->prepare($sql_str);

        $res = $this->query->execute();
        return $this->return_fun($this
                    ->query->queryString, $res, 1,$this->query);
	}
	
	/**
	 * @param $table
	 *
	 * @param array $columns
	 * @return bool
	 */
	public function createTable($table, $columns)
	{
		$sql_str = 'CREATE TABLE IF NOT EXISTS ' . $this->prefix . $table . ' . (id INT(11) NOT NULL AUTO_INCREMENT ';
		foreach ($columns as $col_key => $col_val)
		{
			$sql_str .= ', ' . $col_key . ' ' . $col_val;
		}
		$sql_str .= ', PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;';
		
		$this->query = $this->dbh->prepare($sql_str);

        $res =  $this->query->execute();
        return $this->return_fun($this
                    ->query->queryString, $res, 1,$this->query);
	}

    	/**
	 * method select.
	 *    - retrieve information from the database, as an array
	 *
	 * @param string|array $table    - the name of the db table we are retreiving the rows from
	 * @param array        $where    - associative array representing the WHERE clause filters
	 * @param int          $limit    (optional) - the amount of rows to return
	 * @param int          $start    (optional) - the row to start on, indexed by zero
	 * @param array        $order_by (optional) - an array with order by clause
	 *
	 * @return mixed - associate representing the fetched table row, false on failure
	 */
    public function select($table, $where = [], $limit = null, $start = null, $order_by = [],$function = "",$group_by = '')
    {
        // Building Query String
        $sql_str = "SELECT ".$function." ";

        if (is_array($table))
        { // if Table Was Array you can pass particular fields to select
            if (is_array($table[1]))
            {
                $sql_str .= implode(",  ", $table[1]) . " FROM ";
            }
            else
            {
                $sql_str .= $table[1] . "  FROM ";
            }

            $sql_str .= $this->prefix . $table[0];
        }
        else
        {
            $sql_str .= ' * FROM ' . $this->prefix . $table;
        }

        $add_and = false;

        // WHERE clouse Begins
        if (!empty($where) and is_array($where))
        {

            // Append WHERER if necessery
            $sql_str .= " WHERE ";

            // add each clause using parameter array
            foreach ($where as $key => $val)
            {
                // only add AND after the first clause item has been appended
                if ($add_and)
                {
                    $sql_str .= ' AND ';
                }
                else
                {
                    $add_and = true;
                }

                // append clause item
                $sql_str .= $key . ' = :' . $key;
            }
        } else if (!empty($where) and is_string($where)) {
			// Append WHERER if necessery
			$sql_str .= " WHERE ";
			
            $sql_str .= $where." ";
		}

		if ($group_by) {
			$sql_str .= " GROUP BY ".$group_by;
		}

		        // WHERE clouse Ends
        // add the order by clause if we have one
        if (!empty($order_by))
        {

			if (is_array($order_by)) {

				$sql_str .= ' ORDER BY ';
				// $add_comma = false;
				// foreach ($order_by as $column => $order)
				// {
					//     if ($add_comma)
					//     {
            //         $sql_str .= ', ';
            //     }
            //     else
            //     {
				//         $add_comma = true;
				//     }
				//     $sql_str .= $column . ' ' . $order;
				// }
				$sql_str .= implode(",",$order_by);
			} elseif (is_string($order_by)) {
				$sql_str .= ' ORDER BY '.$order_by;
			}
		}

        // $this->sql_sm = $sql_str;
        try
        {
            // now we attempt to retrieve the row using the sql string
            $pdoDriver = $this
                ->dbh
                ->getAttribute(PDO::ATTR_DRIVER_NAME);

            //@TODO MS SQL Server & Oracle handle LIMITs differently, for now its disabled but we should address it later.
            $disableLimit = ['sqlsrv', 'mssql', 'oci'];

            // add the limit clause if we have one
            if (!empty($limit) and !in_array($pdoDriver, $disableLimit))
            {
                $sql_str .= ' LIMIT ' . (!empty($start) ? $start . ', ' : '') . $limit;
            }

            $this->query = $this
                ->dbh
                ->prepare($sql_str);

            if (!empty($where) and is_array($where))
            {
                // bind each parameter in the array
                foreach ($where as $key => $val)
                {

                    $this
                        ->query
                        ->bindValue(':' . $key, $val);
                }
			}
			// print_r($this->query);

            $this
                ->query
                ->execute();

            // $this->sql_sm = $this->query->queryString;
            // now return the results, depending on if we want all or first row only
            if (!is_null($limit) and $limit == 1)
            {
                $res = $this
                    ->query
                    ->fetch();
                return $this->return_fun($this
                    ->query->queryString, $res, 1,$this->query);
            }
            else
            {
                $res = [];
                while ($row = $this
                    ->query
                    ->fetch())
                {
                    $res[] = $row;
                }

                // return $res;
                return $this->return_fun($this
                    ->query->queryString, $res, 1,$this->query);
                // return $this->query->fetchAll(); >> may be not best when there are many rows
                
            }

        }
        catch(\PDOException $e)
        {
            error_log($e);
            // print_r();
            // return false;
            return $this->return_fun($this
                ->query->queryString, false, 0, $e,$this->query);
        }
    }

    	/**
	 * method selectJoin.
	 *    - retrieve information from the database, as an array from several tables
	 *
	 * @param array $table_cols - items of the db tables we are retreiving the rows from and joining
	 * @param array $conditions - associative array representing the WHERE clause filters
	 * @param array $where (optional)
	 * @param int $limit (optional) - the amount of rows to return
	 * @param int $start (optional) - the row to start on, indexed by zero
	 * @param array $order_by (optional) - an array with order by clause
	 *
	 * @return mixed - associate representing the fetched table row, false on failure
	 */
	public function selectJoin($table_cols = [], $conditions = [], $where = [], $limit = null, $start = null, $order_by = [])
	{
		// building query string
		$sql_str = 'SELECT ';
		
		$key_number = 0;
		
		foreach ($table_cols as $table_name => $columns)
		{
			$sql_str .= $table_name . '.';
			
			$sql_str .= implode(', '.$table_name.'.', $columns);
			
			$key_number++;
			if ($key_number != count($table_cols))
			{
				$sql_str .= ', ';
			}
			
		}
		
		if (!function_exists('array_key_first')) {
			function array_key_first(array $arr) {
				foreach($arr as $key => $unused) {
					return $key;
				}
				return NULL;
			}
		}
		
		$sql_str .= ' FROM ' . $this->prefix . array_key_first($table_cols);
		
		foreach ($conditions as $cond_tbl => $cond_cols)
		{
			$sql_str .= ' JOIN ' . $this->prefix . $cond_tbl . ' ON ' . $this->prefix . $cond_cols[0] . ' = ' . $cond_cols[1];
		}
		
		$add_and = false;
		
		if (!empty($where) and is_array($where))
		{
			// append WHERE if necessary
			$sql_str .= ' WHERE ';
			// add each clause using parameter array
			foreach ($where as $key => $val)
			{
				// only add AND after the first clause item has been appended
				if ($add_and)
				{
					$sql_str .= ' AND ';
				}
				else
				{
					$add_and = true;
				}
				
				// append clause item
				$sql_str .= $key . ' = :' . $key;
				// $sql_str .= $key . ' = :' . $key;
			}
		} else if (!empty($where)) {
      $sql_str .= ' WHERE '.$where.' ';
    }
		
		// add the order by clause if we have one
		if (!empty($order_by))
		{
			$sql_str   .= ' ORDER BY ';
			$add_comma = false;
			foreach ($order_by as $column => $order)
			{
				if ($add_comma)
				{
					$sql_str .= ', ';
				}
				else
				{
					$add_comma = true;
				}
				$sql_str .= $column . ' ' . $order;
			}
		}
		
		try
		{
			// now we attempt to retrieve the row using the sql string
			$pdoDriver = $this->dbh->getAttribute(\PDO::ATTR_DRIVER_NAME);
			
			//@TODO MS SQL Server & Oracle handle LIMITs differently, for now its disabled but we should address it later.
			$disableLimit = ['sqlsrv', 'mssql', 'oci'];
			
			// add the limit clause if we have one
			if (!empty($limit) and !in_array($pdoDriver, $disableLimit))
			{
				$sql_str .= ' LIMIT ' . (!empty($start) ? $start . ', ' : '') . $limit;
			}
			
			$this->query = $this->dbh->prepare($sql_str);
			
			if (!empty($where) and is_array($where))
			{
				// bind each parameter in the array
				foreach ($where as $key => $val)
				{
					$this->query->bindValue(':' . $key, $val);
				}
			}
			
			$this->query->execute();
			
			// now return the results, depending on if we want all or first row only
			if (!is_null($limit) and $limit == 1)
			{
                $res = $this->query->fetch();
                return $this->return_fun($this
                            ->query->queryString, $res, 1, $this->query);
			}
			else
			{
				$res = [];
				while ($row = $this->query->fetch())
				{
					$res[] = $row;
				}
				
				return $this->return_fun($this
                    ->query->queryString, $res, 1,$this->query);
				// return $this->query->fetchAll(); >> may be not best when there are many rows
			}
			
		}
		catch (\PDOException $e)
		{
			error_log($e);
			
			return $this->return_fun($this
                ->query->queryString, false, 0, $e, $this->query);
		}
    }
    

    	/**
	 * method insert.
	 *    - adds a row to the specified table
	 *
	 * @param string $table          - the name of the db table we are adding row to
	 * @param array  $params         - associative array representing the columns and their respective values
	 * @param bool   $timestamp_this (Optional), if true we set date_created and date_modified values to now
	 *
	 * @return mixed - new primary key of inserted table, false on failure
	 */
	public function insert($table, $params, $timestamp_this = null)
	{
		if (is_null($timestamp_this))
		{
			$timestamp_this = $this->timestamp_writes;
		}
		// first we build the sql query string
		$columns_str = ' (';
		$values_str  = ' VALUES (';
		$add_comma   = false;

		// Add All table needed details on here

		$params['acc_year'] 		= $_SESSION['acc_year'];
		$params['session_id'] 		= session_id();
		$params['sess_user_type'] 	= $_SESSION['sess_user_type'];
		$params['sess_user_id'] 	= $_SESSION['sess_user_id'];
		$params['sess_company_id'] 	= $_SESSION['sess_company_id'];
		$params['sess_branch_id'] 	= $_SESSION['sess_branch_id'];

		// add each parameter into the query string
		foreach ($params as $key => $val)
		{
			// only add comma after the first parameter has been appended
			if ($add_comma)
			{
				$columns_str .= ', ';
				$values_str  .= ', ';
			}
			else
			{
				$add_comma = true;
			}

			// now append the parameter
			$columns_str .= $key;
			$values_str  .= ':' . $key;
		}

		// add the timestamp columns if necessary
		if ($timestamp_this === true)
		{
			$columns_str .= ($add_comma ? ', ' : '') . 'date_created, date_modified';
			$values_str  .= ($add_comma ? ', ' : '') . time() . ', ' . time();
		}

		// close the builder strings
		$columns_str .= ') ';
		$values_str  .= ')';

		// build final insert string
		$sql_str = 'INSERT INTO ' . $this->prefix . $table . $columns_str . $values_str;

		// now we attempt to write this row into the database
		try
		{

			$this->query = $this->dbh->prepare($sql_str);

			// bind each parameter in the array
			foreach ($params as $key => $val)
			{
				if ($val === 'CURRENT_TIMESTAMP' || $val === 'NOW()')
				{
					$val = date('Y-m-d H:i:s');
				}
				$this->query->bindValue(':' . $key, $val);
			}

			$this->query->execute();
			$res = $this->dbh->lastInsertId();

			// return the new id
            // return $newID;
            return $this->return_fun($this
                    ->query->queryString, $res, 1,$this->query);

		}
		catch (\PDOException $e)
		{
			error_log($e);

            // return false;
            return $this->return_fun($this
                ->query->queryString, false, 0, $e, $this->query);
		}

    }
    
    /**
	 * method insertMultiple.
	 *    - adds multiple rows to a table with a single query
	 *
	 * @param string $table           - the name of the db table we are adding row to
	 * @param array  $columns         - contains the column names
	 * @param array  $rows            - contains the rows with values
	 * @param bool   $timestamp_these (Optional), if true we set date_created and date_modified values to NOW() for each row
	 *
	 * @return mixed - new primary key of inserted table, false on failure
	 */
	public function insertMultiple($table, $columns = [], $rows = [], $timestamp_these = null)
	{

		$columns[]	= 'acc_year';
		$columns[]	= 'session_id';
		$columns[]	= 'sess_user_type';
		$columns[]	= 'sess_user_id';
		$columns[]	= 'sess_company_id';
		$columns[]	= 'sess_branch_id';

		$row_data 	= [];
		// Add All table needed details on here

		foreach ($rows as $row_key => $row_value) {

			$row_value['acc_year'] 			= $_SESSION['acc_year'];
			$row_value['session_id'] 		= session_id();
			$row_value['sess_user_type'] 	= $_SESSION['sess_user_type'];
			$row_value['sess_user_id'] 		= $_SESSION['sess_user_id'];
			$row_value['sess_company_id'] 	= $_SESSION['sess_company_id'];
			$row_value['sess_branch_id'] 	= $_SESSION['sess_branch_id'];
			$row_data[]						= $row_value;
			
		}

		$rows		= $row_data;
				
		if (is_null($timestamp_these))
		{
			$timestamp_these = $this->timestamp_writes;
		}
		// generate the columns portion of the insert statement
		// adding the timestamp fields if needs be
		if ($timestamp_these === true)
		{
			$columns[] = 'date_created';
			$columns[] = 'date_modified';
		}
		$columns_str = ' (' . implode(',', $columns) . ') ';

		// generate the values portions of the string
		$values_str = 'VALUES ';
		$add_comma  = false;

		foreach ($rows as $row_index => $row_values)
		{
			// only add comma after the first row has been added
			if ($add_comma)
			{
				$values_str .= ', ';
			}
			else
			{
				$add_comma = true;
			}

			// here we will create the values string for a single row
			$values_str          .= ' (';
			$add_comma_for_value = false;
			foreach ($row_values as $value_index => $value)
			{
				if ($add_comma_for_value)
				{
					$values_str .= ', ';
				}
				else
				{
					$add_comma_for_value = true;
				}
				// generate the bind variable name based on the row and column index
				$values_str .= ':' . $row_index . '_' . $value_index;
			}
			// append timestamps if necessary
			if ($timestamp_these)
			{
				$values_str .= ($add_comma_for_value ? ', ' : '') . time() . ', ' . time();
			}
			$values_str .= ')';
		}

		// build final insert string
		$sql_str = 'INSERT INTO ' . $this->prefix . $table . $columns_str . $values_str;

		// now we attempt to write this multi insert query to the database using a transaction
		try
		{
			$this->dbh->beginTransaction();
			$this->query = $this->dbh->prepare($sql_str);

			// traverse the 2d array of rows and values to bind all parameters
			foreach ($rows as $row_index => $row_values)
			{
				foreach ($row_values as $value_index => $value)
				{
					$this->query->bindValue(':' . $row_index . '_' . $value_index, $value);
				}
			}

			// now lets execute the statement, commit the transaction and return
			$this->query->execute();
			$this->dbh->commit();

            // return true;
            return $this->return_fun($this
                    ->query->queryString, true, 1,$this->query);
		}
		catch (\PDOException $e)
		{
			$this->dbh->rollback();
			error_log($e);

            // return false;
            return $this->return_fun($this
                ->query->queryString, false, 0, $e, $this->query);
		}
    }
    
    /**
	 * @return string - the last inserted id. Needs in ajax often, for example
	 */
	public function lastInsertId()
	{
		return $this->dbh->lastInsertId();
    }
    

    /**
	 * method update.
	 *    - updates a row to the specified table
	 *
	 * @param string $table          - the name of the db table we are adding row to
	 * @param array  $params         - associative array representing the columns and their respective values to update
	 * @param array  $wheres         (Optional) - the where clause of the query
	 * @param bool   $timestamp_this (Optional) - if true we set date_created and date_modified values to now
	 *
	 * @return int|bool - the amount of rows updated, false on failure
	 */
	public function update($table, $params, $wheres = [], $timestamp_this = null)
	{
		if (is_null($timestamp_this))
		{
			$timestamp_this = $this->timestamp_writes;
		}
		// build the set part of the update query by
		// adding each parameter into the set query string
		$add_comma  = false;
		$set_string = '';
		foreach ($params as $key => $val)
		{
			// only add comma after the first parameter has been appended
			if ($add_comma)
			{
				$set_string .= ', ';
			}
			else
			{
				$add_comma = true;
			}

			// now append the parameter
			$set_string .= $key . '=:param_' . $key;
		}

		// add the timestamp columns if necessary
		if ($timestamp_this === true)
		{
			$set_string .= ($add_comma ? ', ' : '') . 'date_modified=' . time();
		}

		// lets add our where clause if we have one
		$where_string = '';
		if (!empty($wheres))
		{
			if (is_array($wheres)) {
				// load each key value pair, and implode them with an AND
				$where_array = [];
				foreach ($wheres as $key => $val)
				{
					$where_array[] = $key . '=:where_' . $key;
				}
				// build the final where string
				$where_string = ' WHERE ' . implode(' AND ', $where_array);
			} else if (is_string($wheres)) {
				$where_string = ' WHERE ' . $wheres;
			}
		}

		// build final update string
		$sql_str = 'UPDATE ' . $this->prefix . $table . ' SET ' . $set_string . $where_string;

		// now we attempt to write this row into the database
		try
		{
			$this->query = $this->dbh->prepare($sql_str);

			// bind each parameter in the array
			foreach ($params as $key => $val)
			{
				$this->query->bindValue(':param_' . $key, $val);
			}

			if (is_array($wheres)) {
				// bind each where item in the array
				foreach ($wheres as $key => $val)
				{
					$this->query->bindValue(':where_' . $key, $val);
				}
			}

			// execute the update query
			$successful_update = $this->query->execute();

			// if we were successful, return the amount of rows updated, otherwise return false
            // return ($successful_update == true) ? $this->query->rowCount() : false;
            
            return $this->return_fun($this
                    ->query->queryString, ($successful_update == true) ? $this->query->rowCount() : false, 1,$this->query);
		}
		catch (\PDOException $e)
		{
			error_log($e);

            // return false;
            return $this->return_fun($this
                ->query->queryString, false, 0, $e, $this->query);
		}
    }
    
    /**
	 * method delete.
	 *    - deletes rows from a table based on the parameters
	 *
	 * @param $table  - the name of the db table we are deleting the rows from
	 * @param $params - associative array representing the WHERE clause filters
	 *
	 * @return bool - associate representing the fetched table row, false on failure
	 */
	public function delete($table, $params = "")
	{
		// building query string
		$sql_str = 'DELETE FROM ' . $this->prefix . $table;
		
		if (is_array($params)) {
			// append WHERE if necessary
			$sql_str .= (count($params) > 0 ? ' WHERE ' : '');
	
			$add_and = false;
			// add each clause using parameter array

			foreach ($params as $key => $val)
			{
				// only add AND after the first clause item has been appended
				if ($add_and)
				{
					$sql_str .= ' AND ';
				}
				else
				{
					$add_and = true;
				}
				
				// append clause item
				$sql_str .= $key . ' = :' . $key;
			}
		}

		if (is_string($params)) {
			if ($params) {
				$sql_str 	.= " WHERE ".$params;
			}
		}

		// now we attempt to retrieve the row using the sql string
		try
		{
			$this->query = $this->dbh->prepare($sql_str);

			if (is_array($params)) {
				// bind each parameter in the array
				foreach ($params as $key => $val)
				{
					$this->query->bindValue(':' . $key, $val);
				}
			}

			// execute the delete query
			$successful_delete = $this->query->execute();

			// if we were successful, return the amount of rows updated, otherwise return false
            // return ($successful_delete == true) ? $this->query->rowCount() : false;
            return $this->return_fun($this
            ->query->queryString, ($successful_delete == true) ? $this->query->rowCount() : false, 1,$this->query);
		}
		catch (\PDOException $e)
		{
			error_log($e);

            // return false;
            return $this->return_fun($this
                ->query->queryString, false, 0, $e, $this->query);
        }
        
    }
    
    /**
	 * @param $table
	 *
	 * @return bool
	 */
	public function optimizeTable($table)
	{
		$sql_str     = 'OPTIMIZE TABLE ' . $this->prefix . $table . ';';
		$this->query = $this->dbh->prepare($sql_str);

        // return $this->query->execute();
        return $this->return_fun($this
            ->query->queryString, $this->query->execute(), 1,$this->query);
	}

	/**
	 * @param $table
	 *
	 * @return bool
	 */
	public function truncateTable($table)
	{
		$sql_str     = 'TRUNCATE TABLE ' . $this->prefix . $table . ';';
		$this->query = $this->dbh->prepare($sql_str);

        // return $this->query->execute();
        return $this->return_fun($this
            ->query->queryString, $this->query->execute(), 1,$this->query);
	}

	/**
	 * @param $table
	 *
	 * @return bool
	 */
	public function dropTable($table)
	{
		$sql_str     = 'DROP TABLE IF EXISTS ' . $this->prefix . $table;
		$this->query = $this->dbh->prepare($sql_str);

        // return $this->query->execute();
        return $this->return_fun($this
            ->query->queryString, $this->query->execute(), 1,$this->query);
	}

	/**
	 * @param $database
	 *
	 * @return bool
	 */
	public function dropDatabase($database)
	{
		$sql_str     = 'DROP DATABASE IF EXISTS ' . $database . ';';
		$this->query = $this->dbh->prepare($sql_str);

        // return $this->query->execute();
        return $this->return_fun($this
            ->query->queryString, $this->query->execute(), 1,$this->query);
	}

  /** Custom Return Value Function 
    *
    * Return Back Executed Query Result
    * @param string sql - $sql is Maked Query 
    * @param string or array  - $data is return result 
    * @param boolean $status - if query executes return true , otherwise false
    * @param object or array $error - it returns error array
    * @param object resobj - is total return object
  */
    public function return_fun($sql = "", $data = false, $status = "0", $error = "",$resobj = "")
    {
        $return_array = ["sql" => $sql , "data" => $data, "status" => $status, "error" => $error , "result" => $resobj];

        if ($sql)
        {
            $return_array['sql'] = $sql. "<br />";
        }

        if (!$data)
        {
            $return_array['data'] = $data;
        }

        if ($status)
        {
            $return_array['status'] = intval($status);
        }

        if ($error)
        {
            $return_array['error'] = $error;
        }

        if ($resobj)
        {
            $return_array['result'] = $resobj;
        }

        return (Object)$return_array;
    }
}

// Query Debuging
class MyPDOStatement extends PDOStatement
{
    protected $_debugValues = null;

    protected function __construct()
    {
        // need this empty construct()!
        
    }

    public function execute($values = array())
    {
        $this->_debugValues = $values;
        try
        {
            $t = parent::execute($values);
            // maybe do some logging here?
            
        }
        catch(PDOException $e)
        {
            // maybe do some logging here?
            throw $e;
        }

        return $t;
    }

    public function _debugQuery($replaced = true)
    {
        $q = $this->queryString;

        if (!$replaced)
        {
            return $q;
        }

        return preg_replace_callback('/:([0-9a-z_]+)/i', array(
            $this,
            '_debugReplace'
        ) , $q);
    }

    protected function _debugReplace($m)
    {
        $v = $this->_debugValues[$m[1]];
        if ($v === null)
        {
            return "NULL";
        }
        if (!is_numeric($v))
        {
            $v = str_replace("'", "''", $v);
        }

        return "'" . $v . "'";
    }
}

?>
