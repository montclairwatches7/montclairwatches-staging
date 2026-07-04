<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            CREATE TABLE IF NOT EXISTS products (
              id                INT             AUTO_INCREMENT PRIMARY KEY,
              name              VARCHAR(255)    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
              brand             VARCHAR(255)    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Montclair',
              model_number      VARCHAR(255)    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              price             DECIMAL(12,2)   DEFAULT NULL,
              originalPrice     DECIMAL(10,2)   DEFAULT NULL,
              mrp               DECIMAL(10,2)   DEFAULT NULL,
              image             VARCHAR(255)    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              images            JSON            DEFAULT NULL,
              category          VARCHAR(255)    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'classic',
              collection        VARCHAR(255)    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'chronograph',
              strapType         VARCHAR(255)    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'leather',
              dialColor         VARCHAR(50)     CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              inStock           TINYINT(1)      DEFAULT 1,
              rating            DECIMAL(2,1)    DEFAULT 0.0,
              reviewCount       INT             DEFAULT 0,
              reference         VARCHAR(50)     CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              description       TEXT            CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
              featured          TINYINT(1)      DEFAULT 0,
              trending          TINYINT(1)      DEFAULT 0,
              caseSize          VARCHAR(50)     CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              movementType      VARCHAR(100)    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              movement          VARCHAR(100)    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              waterResistance   VARCHAR(50)     CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              powerReserve      VARCHAR(50)     CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              caseMaterial      VARCHAR(100)    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              caseThickness     VARCHAR(50)     CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              lugWidth          VARCHAR(50)     CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              crystal           VARCHAR(255)    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              functions         TEXT            CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
              warranty          VARCHAR(255)    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              status            ENUM('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'active',
              stock_quantity    INT             DEFAULT 0,
              created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              highlights        TEXT            CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
              boxContents       TEXT            CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
              heroTagline       VARCHAR(255)    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              shortDescription  TEXT            CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
              fullDescription   LONGTEXT        CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
              faq               JSON            DEFAULT NULL,
              metaTitle         VARCHAR(255)    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              metaDescription   VARCHAR(255)    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              urlSlug           VARCHAR(255)    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              case_diameter     VARCHAR(100)    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              case_material     VARCHAR(255)    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              dial_colour       VARCHAR(100)    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              movement_type     VARCHAR(100)    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              caliber           VARCHAR(100)    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              water_resistance  VARCHAR(100)    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              strap_material    VARCHAR(255)    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              power_reserve     VARCHAR(100)    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              case_thickness    VARCHAR(100)    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              lug_width         VARCHAR(100)    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
              key_highlights    TEXT            CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
              whats_in_the_box  TEXT            CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
              UNIQUE KEY reference (reference),
              KEY idx_products_category (category),
              KEY idx_products_price (price),
              KEY idx_products_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        ");
    }

    public function down(): void
    {
        DB::statement("DROP TABLE IF EXISTS products");
    }
};
