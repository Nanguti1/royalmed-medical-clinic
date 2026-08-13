<?php

namespace Database\Seeders;

use App\Models\County;
use App\Models\SubCounty;
use Illuminate\Database\Seeder;

class CountySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $countiesData = [
            [
                'code' => 30,
                'name' => 'Baringo',
                'headquarters' => 'Kabarnet',
                'sub_counties' => ['Baringo Central', 'Baringo North', 'Baringo South', 'Eldama Ravine', 'Mogotio', 'Tiaty'],
            ],
            [
                'code' => 36,
                'name' => 'Bomet',
                'headquarters' => 'Bomet',
                'sub_counties' => ['Bomet Central', 'Bomet East', 'Chepalungu', 'Konoin', 'Sotik'],
            ],
            [
                'code' => 39,
                'name' => 'Bungoma',
                'headquarters' => 'Bungoma',
                'sub_counties' => ['Bumula', 'Kabuchai', 'Kanduyi', 'Kimilili', 'Mt Elgon', 'Sirisia', 'Tongaren', 'Webuye East', 'Webuye West'],
            ],
            [
                'code' => 40,
                'name' => 'Busia',
                'headquarters' => 'Busia',
                'sub_counties' => ['Budalangi', 'Butula', 'Funyula', 'Nambele', 'Teso North', 'Teso South'],
            ],
            [
                'code' => 28,
                'name' => 'Elgeyo-Marakwet',
                'headquarters' => 'Iten',
                'sub_counties' => ['Keiyo North', 'Keiyo South', 'Marakwet East', 'Marakwet West'],
            ],
            [
                'code' => 14,
                'name' => 'Embu',
                'headquarters' => 'Embu',
                'sub_counties' => ['Manyatta', 'Mbeere North', 'Mbeere South', 'Runyenjes'],
            ],
            [
                'code' => 7,
                'name' => 'Garissa',
                'headquarters' => 'Garissa',
                'sub_counties' => ['Daadab', 'Fafi', 'Garissa Township', 'Hulugho', 'Ijara', 'Lagdera', 'Balambala'],
            ],
            [
                'code' => 43,
                'name' => 'Homa Bay',
                'headquarters' => 'Homa Bay',
                'sub_counties' => ['Homabay Town', 'Kabondo', 'Karachwonyo', 'Kasipul', 'Mbita', 'Ndhiwa', 'Rangwe', 'Suba'],
            ],
            [
                'code' => 11,
                'name' => 'Isiolo',
                'headquarters' => 'Isiolo',
                'sub_counties' => ['Isiolo', 'Merti', 'Garbatulla'],
            ],
            [
                'code' => 34,
                'name' => 'Kajiado',
                'headquarters' => 'Kajiado',
                'sub_counties' => ['Isinya', 'Kajiado Central', 'Kajiado North', 'Loitokitok', 'Mashuuru'],
            ],
            [
                'code' => 37,
                'name' => 'Kakamega',
                'headquarters' => 'Kakamega',
                'sub_counties' => ['Butere', 'Kakamega Central', 'Kakamega East', 'Kakamega North', 'Kakamega South', 'Khwisero', 'Lugari', 'Lukuyani', 'Lurambi', 'Matete', 'Mumias', 'Mutungu', 'Navakholo'],
            ],
            [
                'code' => 35,
                'name' => 'Kericho',
                'headquarters' => 'Kericho',
                'sub_counties' => ['Ainamoi', 'Belgut', 'Bureti', 'Kipkelion East', 'Kipkelion West', 'Soin/Sigowet'],
            ],
            [
                'code' => 22,
                'name' => 'Kiambu',
                'headquarters' => 'Kiambu',
                'sub_counties' => ['Gatundu North', 'Gatundu South', 'Githunguri', 'Juja', 'Kabete', 'Kiambaa', 'Kiambu', 'Kikuyu', 'Limuru', 'Ruiru', 'Thika Town', 'Lari'],
            ],
            [
                'code' => 3,
                'name' => 'Kilifi',
                'headquarters' => 'Kilifi',
                'sub_counties' => ['Ganze', 'Kaloleni', 'Kilifi North', 'Kilifi South', 'Magarini', 'Malindi', 'Rabai'],
            ],
            [
                'code' => 20,
                'name' => 'Kirinyaga',
                'headquarters' => 'Kerugoya/Kutus',
                'sub_counties' => ['Kirinyaga Central', 'Kirinyaga East', 'Kirinyaga West', 'Mwea East', 'Mwea West'],
            ],
            [
                'code' => 45,
                'name' => 'Kisii',
                'headquarters' => 'Kisii',
                'sub_counties' => ['Bobasi', 'Bonchari', 'Bomachoge Chache', 'Bomachoge Borabu', 'Kitutu Chache North', 'Kitutu Chache South', 'Nyaribari Chache', 'Nyaribari Masaba', 'South Mugirango'],
            ],
            [
                'code' => 42,
                'name' => 'Kisumu',
                'headquarters' => 'Kisumu',
                'sub_counties' => ['Kisumu Central', 'Kisumu East', 'Kisumu West', 'Muhoroni', 'Nyakach', 'Nyando', 'Seme'],
            ],
            [
                'code' => 15,
                'name' => 'Kitui',
                'headquarters' => 'Kitui',
                'sub_counties' => ['Kitui West', 'Kitui Central', 'Kitui Rural', 'Kitui South', 'Kitui East', 'Mwingi North', 'Mwingi West', 'Mwingi Central'],
            ],
            [
                'code' => 2,
                'name' => 'Kwale',
                'headquarters' => 'Kwale',
                'sub_counties' => ['Kinango', 'Lunga Lunga', 'Msambweni', 'Matuga'],
            ],
            [
                'code' => 31,
                'name' => 'Laikipia',
                'headquarters' => 'Rumuruti',
                'sub_counties' => ['Laikipia Central', 'Laikipia East', 'Laikipia North', 'Laikipia West', 'Nyahururu'],
            ],
            [
                'code' => 5,
                'name' => 'Lamu',
                'headquarters' => 'Lamu',
                'sub_counties' => ['Lamu East', 'Lamu West'],
            ],
            [
                'code' => 16,
                'name' => 'Machakos',
                'headquarters' => 'Machakos',
                'sub_counties' => ['Kathiani', 'Machakos Town', 'Masinga', 'Matungulu', 'Mavoko', 'Mwala', 'Yatta'],
            ],
            [
                'code' => 17,
                'name' => 'Makueni',
                'headquarters' => 'Wote',
                'sub_counties' => ['Kaiti', 'Kibwezi West', 'Kibwezi East', 'Kilome', 'Makueni', 'Mbooni'],
            ],
            [
                'code' => 9,
                'name' => 'Mandera',
                'headquarters' => 'Mandera',
                'sub_counties' => ['Banissa', 'Lafey', 'Mandera East', 'Mandera North', 'Mandera South', 'Mandera West'],
            ],
            [
                'code' => 10,
                'name' => 'Marsabit',
                'headquarters' => 'Marsabit',
                'sub_counties' => ['Laisamis', 'Moyale', 'North Horr', 'Saku'],
            ],
            [
                'code' => 12,
                'name' => 'Meru',
                'headquarters' => 'Meru',
                'sub_counties' => ['Buuri', 'Igembe Central', 'Igembe North', 'Igembe South', 'Imenti Central', 'Imenti North', 'Imenti South', 'Tigania East', 'Tigania West'],
            ],
            [
                'code' => 44,
                'name' => 'Migori',
                'headquarters' => 'Migori',
                'sub_counties' => ['Awendo', 'Kuria East', 'Kuria West', 'Mabera', 'Ntimaru', 'Rongo', 'Suna East', 'Suna West', 'Uriri'],
            ],
            [
                'code' => 1,
                'name' => 'Mombasa',
                'headquarters' => 'Mombasa City',
                'sub_counties' => ['Changamwe', 'Jomvu', 'Kisauni', 'Likoni', 'Mvita', 'Nyali'],
            ],
            [
                'code' => 21,
                'name' => "Murang'a",
                'headquarters' => "Murang'a",
                'sub_counties' => ['Gatanga', 'Kahuro', 'Kandara', 'Kangema', 'Kigumo', 'Kiharu', 'Mathioya', "Murang'a South"],
            ],
            [
                'code' => 47,
                'name' => 'Nairobi',
                'headquarters' => 'Nairobi City',
                'sub_counties' => ['Dagoretti North', 'Dagoretti South', 'Embakasi Central', 'Embakasi East', 'Embakasi North', 'Embakasi South', 'Embakasi West', 'Kamukunji', 'Kasarani', 'Kibra', "Lang'ata", 'Makadara', 'Mathare', 'Roysambu', 'Ruaraka', 'Starehe', 'Westlands'],
            ],
            [
                'code' => 32,
                'name' => 'Nakuru',
                'headquarters' => 'Nakuru',
                'sub_counties' => ['Bahati', 'Gilgil', 'Kuresoi North', 'Kuresoi South', 'Molo', 'Naivasha', 'Nakuru Town East', 'Nakuru Town West', 'Njoro', 'Rongai', 'Subukia'],
            ],
            [
                'code' => 29,
                'name' => 'Nandi',
                'headquarters' => 'Kapsabet',
                'sub_counties' => ['Aldai', 'Chesumei', 'Emgwen', 'Mosop', 'Nandi Hills', 'Tindiret'],
            ],
            [
                'code' => 33,
                'name' => 'Narok',
                'headquarters' => 'Narok',
                'sub_counties' => ['Narok East', 'Narok North', 'Narok South', 'Narok West', 'Transmara East', 'Transmara West'],
            ],
            [
                'code' => 46,
                'name' => 'Nyamira',
                'headquarters' => 'Nyamira',
                'sub_counties' => ['Borabu', 'Manga', 'Masaba North', 'Nyamira North', 'Nyamira South'],
            ],
            [
                'code' => 18,
                'name' => 'Nyandarua',
                'headquarters' => 'Ol Kalou',
                'sub_counties' => ['Kinangop', 'Kipipiri', 'Ndaragwa', 'Ol-Kalou', 'Ol Joro Orok'],
            ],
            [
                'code' => 19,
                'name' => 'Nyeri',
                'headquarters' => 'Nyeri',
                'sub_counties' => ['Kieni East', 'Kieni West', 'Mathira East', 'Mathira West', 'Mukurweini', 'Nyeri Town', 'Othaya', 'Tetu'],
            ],
            [
                'code' => 25,
                'name' => 'Samburu',
                'headquarters' => 'Maralal',
                'sub_counties' => ['Samburu East', 'Samburu North', 'Samburu West'],
            ],
            [
                'code' => 41,
                'name' => 'Siaya',
                'headquarters' => 'Siaya',
                'sub_counties' => ['Alego Usonga', 'Bondo', 'Gem', 'Rarieda', 'Ugenya', 'Ugunja'],
            ],
            [
                'code' => 6,
                'name' => 'Taita-Taveta',
                'headquarters' => 'Voi',
                'sub_counties' => ['Mwatate', 'Taveta', 'Voi', 'Wundanyi'],
            ],
            [
                'code' => 4,
                'name' => 'Tana River',
                'headquarters' => 'Hola',
                'sub_counties' => ['Bura', 'Galole', 'Garsen'],
            ],
            [
                'code' => 13,
                'name' => 'Tharaka-Nithi',
                'headquarters' => 'Chuka',
                'sub_counties' => ['Tharaka North', 'Tharaka South', 'Chuka', 'Igambang\'ombe', 'Maara', 'Chiakariga', 'Muthambi'],
            ],
            [
                'code' => 26,
                'name' => 'Trans-Nzoia',
                'headquarters' => 'Kitale',
                'sub_counties' => ['Cherangany', 'Endebess', 'Kiminini', 'Kwanza', 'Saboti'],
            ],
            [
                'code' => 23,
                'name' => 'Turkana',
                'headquarters' => 'Lodwar',
                'sub_counties' => ['Loima', 'Turkana Central', 'Turkana East', 'Turkana North', 'Turkana South'],
            ],
            [
                'code' => 27,
                'name' => 'Uasin Gishu',
                'headquarters' => 'Eldoret',
                'sub_counties' => ['Ainabkoi', 'Kapseret', 'Kesses', 'Moiben', 'Soy', 'Turbo'],
            ],
            [
                'code' => 38,
                'name' => 'Vihiga',
                'headquarters' => 'Vihiga',
                'sub_counties' => ['Emuhaya', 'Hamisi', 'Luanda', 'Sabatia', 'Vihiga'],
            ],
            [
                'code' => 8,
                'name' => 'Wajir',
                'headquarters' => 'Wajir',
                'sub_counties' => ['Eldas', 'Tarbaj', 'Wajir East', 'Wajir North', 'Wajir South', 'Wajir West'],
            ],
            [
                'code' => 24,
                'name' => 'West Pokot',
                'headquarters' => 'Kapenguria',
                'sub_counties' => ['Central Pokot', 'North Pokot', 'Pokot South', 'West Pokot'],
            ],
        ];

        foreach ($countiesData as $countyData) {
            $county = County::firstOrCreate(
                ['name' => $countyData['name']],
                [
                    'code' => $countyData['code'],
                    'headquarters' => $countyData['headquarters'],
                ]
            );

            foreach ($countyData['sub_counties'] as $subCountyName) {
                SubCounty::firstOrCreate(
                    [
                        'county_id' => $county->id,
                        'name' => $subCountyName,
                    ]
                );
            }
        }
    }
}
