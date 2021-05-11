/* eslint no-underscore-dangle: ["error", { "allow": ["_plugin"] }] */

const { default: PQueue } = require("p-queue");
const logger = require("../../logger");
const { Store } = require("../../models/Store");
const EnlivenHealthAppointments = require("../EnlivenHealth/Appointments");

const normalizedAddressMapping = {
  "1010-53rd-ave-e-bradenton-fl-34203": "1010-53rd-ave-e-oneco-fl-34203",
  "1021-lockwood-blvd-oviedo-fl-32765":
    "1021-lockwood-blvd-unit-8-oviedo-fl-32765",
  "1049-62nd-ave-n-st-petersburg-fl-33702":
    "1049-62-ave-n-st-petersburg-fl-33702",
  "10579-big-bend-rd-riverview-fl-33579":
    "10665-big-bend-rd-riverview-fl-33579",
  "10915-baymeadows-rd-unit-12-jacksonville-fl-32256":
    "10915-122-baymeadows-rd-unit-12-jacksonville-fl-32256",
  "11310-se-highway-301-belleview-fl-34420":
    "11310-se-hwy-301-belleview-fl-34420",
  "13508-florida-ave-tampa-fl-33612": "13508-n-florida-ave-tampa-fl-33612",
  "14134-us-hwy-19-n-hudson-fl-34667": "14134-us-19-hudson-fl-34667",
  "1565-us-441-n-apopka-fl-32712": "1565-us-441-apopka-fl-32712",
  "15912-e-state-rd-40-silver-springs-fl-34488":
    "15912-e-sr-40-silver-springs-fl-34488",
  "1651-se-us-highway-19-crystal-river-fl-34429":
    "1651-se-hwy-19-crystal-river-fl-34429",
  "1812-hwy-77-s-lynn-haven-fl-32444":
    "1812-hwy-77-s-suite-119-lynn-haven-fl-32444",
  "1955-n-state-rd-19-eustis-fl-32726": "1955-n-sr-19-eustis-fl-32726",
  "2-n-us-hwy-17-92-debary-fl-32713":
    "2-n-charles-r-beall-blvd-debary-fl-32713",
  "2000-kings-hwy-port-charlotte-fl-33952":
    "2000-kings-hwy-port-charlotte-fl-33980",
  "2054-w-byron-butler-pkwy-perry-fl-32348":
    "2057-s-byron-butler-pkwy-suite-1-perry-fl-32348",
  "2139-34th-st-n-saint-petersburg-fl-33713":
    "2139-34th-n-saint-petersburg-fl-33713",
  "220-w-county-road-210-jacksonville-fl-32259":
    "2220-200-county-rd-210-w-jacksonville-fl-32259",
  "2200-n-young-blvd-chiefland-fl-32626":
    "2202-no-young-blvd-chiefland-fl-32626",
  "2261-w-edgewood-ave-jacksonville-fl-32209":
    "2261-edgewood-ave-w-jacksonville-fl-32209",
  "2458-burnsed-blvd-the-villages-fl-32162":
    "2500-burnsed-blvd-the-villages-fl-32163",
  "2533-thomas-dr-panama-city-beach-fl-32408":
    "2533-thomas-dr-panama-city-fl-32408",
  "27301-sr-54-wesley-chapel-fl-33543":
    "27301-wesley-chapel-blvd-wesley-chapel-fl-33543",
  "27405-us-hwy-27-ste-119-leesburg-fl-34748":
    "27405-us-hwy-27-suite-119-leesburg-fl-34748",
  "281-s-w-port-st-lucie-blvd-port-st-lucie-fl-34984":
    "281-sw-port-st-lucie-blvd-port-saint-lucie-fl-34984",
  "2851-henley-rd-green-cove-spgs-fl-32043":
    "2851-henley-rd-ste-200-green-cove-springs-fl-32043",
  "290-solano-rd-ponte-vedra-fl-32082":
    "290-solana-rd-ponte-vedra-beach-fl-32082",
  "300-sw-16th-ave-gainesville-fl-32601":
    "300-s-w-16th-ave-gainesville-fl-32601",
  "31100-cortez-rd-brooksville-fl-34601":
    "31100-cortez-blvd-brooksville-fl-34602",
  "3157-w-23rd-st-panama-city-beach-fl-32405":
    "3157-w-23rd-st-panama-city-fl-32405",
  "3260-hwy-17-green-cove-spgs-fl-32043":
    "3260-highway-17-green-cove-springs-fl-32043",
  "3280-s-tamiami-trl-port-charlotte-fl-33952":
    "3280-tamiami-trl-port-charlotte-fl-33952",
  "3314-canoe-creek-rd-st-cloud-fl-34772":
    "3318-canoe-creek-rd-saint-cloud-fl-34772",
  "3551-n-ponce-deleon-blvd-st-augustine-fl-32084":
    "3551-n-ponce-de-leon-blvd-st-augustine-fl-32084",
  "36019-us-hwy-27-haines-city-fl-33844":
    "36019-us-hwy-27-n-haines-city-fl-33844",
  "3621-us-hwy-231-n-panama-city-fl-32404":
    "3621-us-231-n-panama-city-fl-32404",
  "3792-s-suncoast-blvd-homosassa-springs-fl-34448":
    "3792-s-suncoast-blvd-homosassa-fl-34448",
  "4445-sun-city-center-blvd-sun-city-center-fl-33573":
    "4445-sun-city-cntr-blvd-sun-city-center-fl-33573",
  "445-havendale-blvd-auburndale-fl-33823":
    "441-havendale-blvd-auburndale-fl-33823",
  "470-w-madison-starke-fl-32091": "470-w-madison-st-starke-fl-32091",
  "4855-irlo-bronson-hwy-st-cloud-fl-34771":
    "4855-irlo-bronson-memorial-hwy-saint-cloud-fl-34771",
  "515-7th-st-palmetto-fl-34220": "515-7th-st-w-palmetto-fl-34220",
  "5250-moncrief-rd-jacksonville-fl-32219":
    "5250-moncrief-rd-w-jacksonville-fl-32219",
  "541494-us-hwy-1-hilliard-fl-32046": "550969-us-hwy-1-hilliard-fl-32046",
  "5690-bayshore-rd-fort-myers-fl-33917":
    "5660-bayshore-rd-fort-myers-fl-33917",
  "5850-nw-183rd-st-hialeah-fl-33015": "5850-n-w-183rd-st-hialeah-fl-33015",
  "5909-university-blvd-jacksonville-fl-32216":
    "5909-university-blvd-w-jacksonville-fl-32216",
  "6929-us-highway-301-s-riverview-fl-33569":
    "6929-us-hwy-301-s-riverview-fl-33569",
  "703-chaffee-rd-s-jacksonville-fl-32221":
    "703-chaffee-rd-jacksonville-fl-32221",
  "7131-n-us-highway-441-ocala-fl-34475": "7131-n-us-hwy-441-ocala-fl-34475",
  "7921-normandy-blvd-jacksonville-fl-32205":
    "7921-normandy-blvd-jacksonville-fl-32221",
  "805-e-doctor-martin-luther-tampa-fl-33603":
    "805-e-dr-mlk-jr-blvd-tampa-fl-33603",
  "8650-argyle-forest-blvd-jacksonville-fl-32244":
    "8560-argyle-forest-blvd-jacksonville-fl-32244",
  "901-highway-19-s-palatka-fl-32217": "901-hwy-19-s-palatka-fl-32177",
  "99-eglin-pkwy-nw-ft-walton-beach-fl-32548":
    "99-eglin-pkwy-nw-fort-walton-beach-fl-32548",
  "995-fellsmere-rd-unit-b-sebastian-fl-32958":
    "995-sebastian-blvd-ste-b-sebastian-fl-32958",
};

class Appointments {
  static async refreshStores() {
    logger.notice("Begin refreshing appointments for all stores...");

    const queue = new PQueue({ concurrency: 1 });

    EnlivenHealthAppointments.setup(Appointments);

    const stores = await Store.query()
      .select("stores.*", "provider_brands.key AS provider_brand_key")
      .where("stores.provider_id", "southeastern_grocers")
      .join("provider_brands", "provider_brands.id", "stores.provider_brand_id")
      .orderByRaw("appointments_last_fetched NULLS FIRST");
    for (const [index, store] of stores.entries()) {
      queue.add(() =>
        EnlivenHealthAppointments.refreshStore(
          Appointments,
          store,
          index,
          stores.length
        )
      );
    }
    await queue.onIdle();

    logger.notice("Finished refreshing appointments for all stores.");
  }

  static getSocketUrlId(store) {
    let urlId;
    if (store.provider_brand_key === "fresco_y_mas") {
      urlId = "b3fde86550b84e7882b1c09763f7b0ea";
    } else if (store.provider_brand_key === "harveys") {
      urlId = "2133b9d6b17e471ab5026a2955916bfb";
    } else if (
      store.provider_brand_key === "winn_dixie" &&
      store.state === "AL"
    ) {
      urlId = "06f559fe3b0648d1915f3bf4f83e3521";
    } else if (
      store.provider_brand_key === "winn_dixie" &&
      store.state === "FL"
    ) {
      urlId = "c20605cb988e4a18a3eab5f7fd466cf6";
    } else if (
      store.provider_brand_key === "winn_dixie" &&
      store.state === "GA"
    ) {
      urlId = "6af6e46827294f9584557bbfd01b6293";
    } else if (
      store.provider_brand_key === "winn_dixie" &&
      store.state === "LA"
    ) {
      urlId = "1ef4aae84d6e484e82f22cbfb9383e5d";
    } else if (
      store.provider_brand_key === "winn_dixie" &&
      store.state === "MS"
    ) {
      urlId = "04ec5ed02145433ea25759a38403253d";
    }

    return urlId;
  }

  static getNormalizedAddress(normalizedAddress) {
    const mapped = normalizedAddressMapping[normalizedAddress];
    return mapped || normalizedAddress;
  }
}

module.exports = Appointments;
