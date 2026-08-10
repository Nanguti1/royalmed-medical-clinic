<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    // Thin extension so App\Models\Role points to Spatie's Role model
}
