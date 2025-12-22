import React, { useState } from 'react';
import { FileText, Code, Server, Smartphone, Copy, Check, Download } from 'lucide-react';

export const ApiDocs = () => {
  const [activeTab, setActiveTab] = useState<'backend' | 'mobile' | 'api'>('backend');
  const [copied, setCopied] = useState('');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleDownload = () => {
     // Create a dummy text file with instructions and code
     const element = document.createElement("a");
     const fileContent = `
=========================================
QATSHOP - SOURCE CODE INSTRUCTIONS
=========================================

1. BACKEND (LARAVEL)
--------------------
Use the provided ProductController.php and Migration files.
Run: composer install
Run: php artisan migrate

2. MOBILE APP (FLUTTER)
-----------------------
Create a new flutter project: flutter create qatshop
Replace lib/main.dart with the provided code.
Add dependencies: provider, http.

3. API ENDPOINTS
----------------
Base URL: http://your-domain.com/api
Auth: Bearer Token (Sanctum)

(Check the Admin Panel > Docs tab for full snippets)
     `;
     const file = new Blob([fileContent], {type: 'text/plain'});
     element.href = URL.createObjectURL(file);
     element.download = "qatshop_source_instruction.txt";
     document.body.appendChild(element);
     element.click();
     document.body.removeChild(element);
  };

  const CodeBlock = ({ id, code, lang, title }: { id: string, code: string, lang: string, title?: string }) => (
    <div className="bg-gray-900 rounded-lg overflow-hidden my-4 border border-gray-700">
      <div className="bg-gray-800 px-4 py-2 flex justify-between items-center">
        <span className="text-xs font-mono text-gray-400 flex items-center gap-2">
           {title && <span className="text-green-400 font-bold">{title}</span>}
           ({lang})
        </span>
        <button 
          onClick={() => copyToClipboard(code, id)}
          className="text-gray-400 hover:text-white flex items-center gap-1 text-xs"
        >
          {copied === id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          {copied === id ? 'تم النسخ' : 'نسخ الكود'}
        </button>
      </div>
      <pre className="p-4 text-sm text-gray-300 overflow-x-auto font-mono" dir="ltr">
        {code}
      </pre>
    </div>
  );

  // --- LARAVEL CODE SNIPPETS ---
  const LARAVEL_PRODUCT_CONTROLLER = `<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Models\\Product;
use Illuminate\\Http\\Request;

class ProductController extends Controller
{
    public function index()
    {
        return response()->json(Product::with('category')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'price' => 'required|numeric',
            'description' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|max:2048'
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image'] = url('storage/' . $path);
        }

        $product = Product::create($validated);
        return response()->json($product, 201);
    }
}`;

  const LARAVEL_ORDER_MIGRATION = `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->decimal('total', 10, 2);
            $table->string('status')->default('pending');
            $table->string('address');
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained();
            $table->integer('quantity');
            $table->decimal('price', 10, 2);
            $table->timestamps();
        });
    }
};`;

  // --- FLUTTER CODE SNIPPETS ---
  const FLUTTER_MAIN = `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'screens/home_screen.dart';
import 'providers/cart_provider.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => CartProvider()),
      ],
      child: const QatShopApp(),
    ),
  );
}

class QatShopApp extends StatelessWidget {
  const QatShopApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'QatShop',
      theme: ThemeData(
        primarySwatch: Colors.green,
        fontFamily: 'Cairo',
      ),
      home: const HomeScreen(),
    );
  }
}`;

const FLUTTER_API_SERVICE = `import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://your-laravel-api.com/api';

  static Future<List<dynamic>> getProducts() async {
    final response = await http.get(Uri.parse('$baseUrl/products'));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load products');
    }
  }

  static Future<void> submitOrder(Map<String, dynamic> orderData, String token) async {
    final response = await http.post(
      Uri.parse('$baseUrl/orders'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode(orderData),
    );
    if (response.statusCode != 201) {
      throw Exception('Failed to submit order');
    }
  }
}`;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">أكواد المشروع (Source Code)</h2>
        <button 
          onClick={handleDownload}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors"
        >
          <Download size={16} />
          تحميل الملفات
        </button>
      </div>
      
      <p className="text-gray-600 mb-6">احصل على الأكواد المصدرية الكاملة للمشروع (Backend & Mobile) للبدء في التطوير الفعلي.</p>
      
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('backend')}
          className={`px-4 py-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${activeTab === 'backend' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Server size={16} /> Laravel Backend
        </button>
        <button 
          onClick={() => setActiveTab('mobile')}
          className={`px-4 py-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${activeTab === 'mobile' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Smartphone size={16} /> Flutter App
        </button>
        <button 
          onClick={() => setActiveTab('api')}
          className={`px-4 py-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${activeTab === 'api' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <FileText size={16} /> API Collection
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        
        {/* BACKEND CONTENT */}
        {activeTab === 'backend' && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
               <h3 className="font-bold text-green-800 mb-2">تعليمات الباك اند</h3>
               <p className="text-sm text-green-700">يتطلب Laravel 10 مع قاعدة بيانات MySQL. استخدم الأكواد التالية لإنشاء المتحكمات والجداول الرئيسية.</p>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-2">1. ProductController.php</h4>
              <p className="text-sm text-gray-500">مسار الملف: <code>app/Http/Controllers/Api/ProductController.php</code></p>
              <CodeBlock id="laravel_prod" code={LARAVEL_PRODUCT_CONTROLLER} lang="php" title="Product Controller" />
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-2">2. Orders Migration</h4>
              <p className="text-sm text-gray-500">مسار الملف: <code>database/migrations/xxxx_create_orders_table.php</code></p>
              <CodeBlock id="laravel_mig" code={LARAVEL_ORDER_MIGRATION} lang="php" title="Database Migration" />
            </div>
          </div>
        )}

        {/* MOBILE CONTENT */}
        {activeTab === 'mobile' && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
               <h3 className="font-bold text-blue-800 mb-2">تعليمات تطبيق الموبايل</h3>
               <p className="text-sm text-blue-700">مشروع Flutter متكامل. يتطلب إضافة مكتبات <code>provider</code> و <code>http</code> في ملف <code>pubspec.yaml</code>.</p>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-2">1. main.dart</h4>
              <p className="text-sm text-gray-500">نقطة انطلاق التطبيق وإعداد الـ Provider.</p>
              <CodeBlock id="flutter_main" code={FLUTTER_MAIN} lang="dart" title="Main Entry Point" />
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-2">2. api_service.dart</h4>
              <p className="text-sm text-gray-500">خدمة الاتصال بالباك اند.</p>
              <CodeBlock id="flutter_api" code={FLUTTER_API_SERVICE} lang="dart" title="API Service" />
            </div>
          </div>
        )}

        {/* API CONTENT */}
        {activeTab === 'api' && (
           <div className="space-y-6 animate-fade-in">
             <div className="p-4 bg-gray-50 text-gray-800 rounded-lg text-sm mb-4">
               توثيق نقاط الاتصال (Endpoints) للاختبار عبر Postman.
             </div>

             <div>
               <h3 className="font-bold text-gray-800 mb-2">POST /api/login</h3>
               <CodeBlock 
                 id="api-login"
                 lang="json"
                 code={`// Request
{
  "phone": "777000000",
  "password": "password123"
}

// Response
{
  "token": "1|laravel_sanctum_token...",
  "user": {
    "id": 1,
    "name": "User Name",
    "phone": "777000000"
  }
}`}
               />
             </div>

             <div>
               <h3 className="font-bold text-gray-800 mb-2">GET /api/products</h3>
               <CodeBlock 
                 id="api-products"
                 lang="json"
                 code={`// Response
[
  {
    "id": 1,
    "name": "قات فاخر",
    "price": 5000,
    "image": "url/to/image.jpg"
  },
  ...
]`}
               />
             </div>

             <div>
               <h3 className="font-bold text-gray-800 mb-2">POST /api/orders</h3>
               <CodeBlock 
                 id="api-order"
                 lang="json"
                 code={`// Request (Requires Auth Token)
{
  "items": [
    {"product_id": 1, "quantity": 2},
    {"product_id": 3, "quantity": 1}
  ],
  "address": "Sana'a, Hadda Street"
}`}
               />
             </div>
           </div>
        )}

      </div>
    </div>
  );
};