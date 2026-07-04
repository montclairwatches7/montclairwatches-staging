<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class GenericController extends Controller
{
    private $allowedTables = [
        'banners', 'testimonials', 'posts', 'faqs',
        'brands', 'teams', 'reviews', 'notifications',
        'services', 'pages'
    ];

    private function validateTable($tableName)
    {
        if (!in_array($tableName, $this->allowedTables)) {
            abort(400, 'Invalid module table');
        }
    }

    public function getAll(Request $request, $tableName)
    {
        $this->validateTable($tableName);

        $page = (int) $request->input('page', 1);
        $limit = (int) $request->input('limit', 20);
        $search = $request->input('search');
        $status = $request->input('status');
        $sort = $request->input('sort', 'created_at');
        $order = $request->input('order', 'desc');

        if (!Schema::hasColumn($tableName, $sort)) {
            $sort = 'id';
        }

        $query = DB::table($tableName);

        if ($status) {
            $query->where('status', $status);
        }

        if ($search) {
            $columns = Schema::getColumnListing($tableName);
            $query->where(function ($q) use ($columns, $search) {
                $searchFields = ['title', 'name', 'question', 'user_name'];
                foreach ($searchFields as $field) {
                    if (in_array($field, $columns)) {
                        $q->orWhere($field, 'LIKE', '%' . $search . '%');
                    }
                }
            });
        }

        $total = $query->count();
        $offset = ($page - 1) * $limit;

        $rows = $query->orderBy($sort, strtolower($order) === 'asc' ? 'asc' : 'desc')
            ->offset($offset)
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $rows,
            'meta' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($total / $limit),
            ]
        ]);
    }

    public function getById($tableName, $id)
    {
        $this->validateTable($tableName);

        $row = DB::table($tableName)->where('id', $id)->first();

        if (!$row) {
            return response()->json(['success' => false, 'message' => 'Record not found'], 404);
        }

        return response()->json(['success' => true, 'data' => $row]);
    }

    public function create(Request $request, $tableName)
    {
        $this->validateTable($tableName);

        $data = $request->all();
        
        // Filter keys that don't match table columns to prevent DB exceptions
        $columns = Schema::getColumnListing($tableName);
        $insertData = array_intersect_key($data, array_flip($columns));

        if (in_array('created_at', $columns) && !isset($insertData['created_at'])) {
            $insertData['created_at'] = now();
        }
        if (in_array('updated_at', $columns) && !isset($insertData['updated_at'])) {
            $insertData['updated_at'] = now();
        }

        $id = DB::table($tableName)->insertGetId($insertData);
        $newRecord = DB::table($tableName)->where('id', $id)->first();

        return response()->json(['success' => true, 'data' => $newRecord], 201);
    }

    public function update(Request $request, $tableName, $id)
    {
        $this->validateTable($tableName);

        $data = $request->all();
        $columns = Schema::getColumnListing($tableName);
        $updateData = array_intersect_key($data, array_flip($columns));

        if (in_array('updated_at', $columns)) {
            $updateData['updated_at'] = now();
        }

        $affected = DB::table($tableName)->where('id', $id)->update($updateData);

        if ($affected === 0 && !DB::table($tableName)->where('id', $id)->exists()) {
            return response()->json(['success' => false, 'message' => 'Record not found'], 404);
        }

        $updatedRecord = DB::table($tableName)->where('id', $id)->first();

        return response()->json(['success' => true, 'data' => $updatedRecord]);
    }

    public function delete($tableName, $id)
    {
        $this->validateTable($tableName);

        $deleted = DB::table($tableName)->where('id', $id)->delete();

        if (!$deleted) {
            return response()->json(['success' => false, 'message' => 'Record not found'], 404);
        }

        return response()->json(['success' => true, 'message' => 'Record deleted successfully']);
    }

    public function bulkAction(Request $request, $tableName)
    {
        $this->validateTable($tableName);

        $action = $request->input('action');
        $ids = $request->input('ids');

        if (!$ids || !is_array($ids) || count($ids) === 0) {
            return response()->json(['success' => false, 'message' => 'No IDs provided'], 400);
        }

        if ($action === 'delete') {
            DB::table($tableName)->whereIn('id', $ids)->delete();
        } elseif ($action === 'activate') {
            DB::table($tableName)->whereIn('id', $ids)->update(['status' => 'active']);
        } elseif ($action === 'deactivate') {
            DB::table($tableName)->whereIn('id', $ids)->update(['status' => 'inactive']);
        } else {
            return response()->json(['success' => false, 'message' => 'Invalid action'], 400);
        }

        return response()->json(['success' => true, 'message' => "Bulk {$action} successful"]);
    }
}
