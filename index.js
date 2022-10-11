const { Neo4jGraphQL } = require("@neo4j/graphql");
const { ApolloServer, gql } = require("apollo-server");
const neo4j = require("neo4j-driver");

require('dotenv').config()

const typeDefs = gql`

type Aarbo {
  aarboID:                        ID @id
  intro:                          String
  territory:                      [Territory]       @relationship(type: "HAS_AARBO_TERRITORY", properties:"HAS_TERRITORY",direction: IN)
  business_type:                  [BusinessType]    @relationship(type: "HAS_AARBO_BUSINESSTYPE", properties:"HAS_TERRITORY",direction: IN)
}

type Accept {
acceptID:                         ID @id
inviteID:                         ID 
connectID:                        ID
taskID:                           ID
date_create:                      DateTime @timestamp
task:                             String
homeID:                           ID

supplierID:                       ID
zip:                              ID
territoryID:                      ID
subcategoryID:                    ID
categoryID:                       ID
dayID:                            ID
weekID:                           ID
monthID:                          ID
yearID:                           ID
description:                      String
timeline:                         String
is_active:                        Boolean
date:                             Date
year:                             Int
month:                            Int
day:                              Int
fee:                              Int
createdAt:                        DateTime
tasks:                            [Task]            @relationship(type: "HAS_ACCEPT_TASK", properties:"HAS_TASK", direction: OUT)
homes:                            [Home]            @relationship(type: "HAS_ACCEPT_HOME",direction: IN)
suppliers:                        [Supplier]        @relationship(type: "HAS_ACCEPT_SUPPLIER", properties:"HAS_SUPPLIER_CONNECT", direction: IN)
supplier_info:                    [SupplierInfo]    @relationship(type: "HAS_ACCEPT_SUPPLIERINFO", properties:"HAS_SUPPLIER_CONNECT", direction: IN)
connects:                         [Connect]         @relationship(type: "HAS_ACCEPT_CONNECT", properties:"HAS_CONNECT", direction: OUT)
days:                             [Day]             @relationship(type: "HAS_ACCEPT_DAY", direction: IN, properties:"HAS_DAY")
weeks:                            [Week]            @relationship(type: "HAS_ACCEPT_WEEK", direction: IN, properties:"HAS_WEEK")
months:                           [Month]           @relationship(type: "HAS_ACCEPT_MONTH", direction: IN, properties:"HAS_MONTH")
todays:                           [Today]           @relationship(type: "HAS_ACCEPT_TODAY", direction: IN)
category:                         [Category]        @relationship(type: "HAS_ACCEPT_CATEGORY", direction: IN, properties:"HAS_CATEGORY")
subcategory:                      [Subcategory]     @relationship(type: "HAS_ACCEPT_SUBCATEGORY", direction: IN, properties:"HAS_SUBCATEGORY")
territory:                        [Territory]       @relationship(type: "HAS_ACCEPT_TERRITORY", properties:"HAS_TERRITORY",direction: IN)
invites:                          [Invite]          @relationship(type: "HAS_ACCEPT_INVITE", direction: IN)
acceptHome:                       [Home] @cypher(statement: """
                                  Match(this)--(h:Home)
                                  Return distinct h
                                  """)
acceptCategory:                   [Category] @cypher(statement: """
                                  Match(this)--(i:Invite)--(c:Category)
                                  Return distinct c
                                  """)
acceptSubcategory:                [Subcategory] @cypher(statement: """
                                  Match(this)--(i:Invite)--(c:Category)--(s:Subcategory)
                                  Return distinct s
                                  """)
acceptTask:                       [Task] @cypher(statement: """
                                  Match(this)--(t:Task)
                                  Return distinct t
                                  """)
acceptItem:                       [Item] @cypher(statement: """
                                  Match(this)--(t:Task)--(i:Item)
                                  Return distinct i
                                  """)
acceptSupplier:                  [Supplier] @cypher(statement: """
                                  Match(this)--(s:Supplier)
                                  Return distinct s
                                  """)
acceptSupplierInfo:              [SupplierInfo] @cypher(statement: """
                                  Match(this)--(s:Supplier)--(si:SupplierInfo)
                                  Return distinct si
                                  """)
}

input AcceptInput {
  task:String
  homeID:ID
  supplierID:ID
  description:String
  inviteID:ID
  connectID:ID
  taskID:ID
  categoryID:ID
  subcategoryID:ID
  territoryID:ID
}

type ActionTask {
  actionID:     ID @id
  action:       String
}

type Area {
  areaID:                         ID @id
  area:                           String
}

type Base {
  baseID:                         ID @id
  createdAt:                      DateTime    @timestamp
  subscriptionID:                 ID 
  planID:                         ID
  uid:                            ID
  supplierID:                     ID
  supplierUID:                    ID
  is_active:                      Boolean
  mysubscription:                 [Mysubscription]       @relationship(type: "HAS_BASE_MYSUBSCRIPTION", direction: IN)
  supplier:                       [Supplier]             @relationship(type: "HAS_BASE_SUPPLIER", direction: IN)
  plan:                           [Plan]                 @relationship(type: "HAS_BASE_PLAN", properties:"HAS_BUSINESSTYPE", direction: IN)
  territory:                      [Territory]            @relationship(type: "HAS_BASE_TERRITORY", properties:"HAS_TERRITORY", direction: OUT)
  business_type:                  [BusinessType]         @relationship(type: "HAS_BASE_BUSINESSTYPE", properties:"HAS_BUSINESSTYPE", direction: OUT)
  baseSubscription:               [Mysubscription]       @cypher(statement: """
                                                        Match(this)--(m:Mysubscription)
                                                        Return distinct m
                                                        """)
  basePlan:                       [Plan]                @cypher(statement: """
                                                        Match(this)--(m:Mysubscription)--(p:Plan)
                                                        Return distinct p
                                                        """)
  baseSupplier:                   [Supplier]            @cypher(statement: """
                                                        Match(this)--(s:Supplier)
                                                        Return distinct s
                                                        """)
  subscriptionTasks:      [Task] @cypher(statement: """
                        match(this)--(ter:Territory)
                        With ter,this
                        Match(this)--(b:BusinessType)
                        With ter,b,this
                        Match(b)--(t:Task)--(ter)
                        RETURN t
                                  """)
}
   

type  BusinessType {
  businessTypeID:                 ID @id
  business_type:                  String
  image_path:                     String
  image_path_header:              String
  createdAt:                      DateTime    @timestamp
  category:                       [Category]  @relationship(type: "HAS_BUSINESSTYPE_CATEGORY", direction: IN)
  tasks:                          [Task]      @relationship(type: "HAS_BUSINESSTYPE_TASK", properties:"HAS_BUSINESSTYPE", direction: IN)
  supplier:                       [Supplier]  @relationship(type: "HAS_BUSINESSTYPE_SUPPLIER", properties:"HAS_BUSINESSTYPE", direction: IN)
  
  
}

interface HAS_BUSINESSTYPE {
  territoryID:                    ID
  date:                           DateTime @ timestamp
  territory:                      String
  zip:                            String
  town:                           String
  business_type:                  String
  category:                       String
  subcategory:                    String
  day:                            Int
  month:                          Int
  week:                           Int
  year:                           Int
  ordinalDay:                     Int
  task_description:               String
  businessTypeID:                 ID
  
}

type Cat {

catID:                  ID @id
categoryID:             ID
category:               String
slug:                   String
description:            String
image_path:             String
image_path_header:      String
sub:                    [Sub] @relationship(type: "HAS_CATEGORY_SUBCATEGORY_old", direction: OUT)

}
type Category {

categoryID:             ID @id
category:               String
slug:                   String
description:            String
image_path:             String
image_path_header:      String
subcategory:            [Subcategory]   @relationship(type: "HAS_CATEGORY_SUBCATEGORY", direction: OUT)
business_type:          [BusinessType]  @relationship(type: "HAS_CATEGORY_BUSINESSTYPE", direction: OUT)
tasks:                  [Task]          @relationship(type: "HAS_CATEGORY_TASK", properties:"HAS_SUBCATEGORY", direction: IN)
territory:              [Territory]     @relationship(type: "HAS_CATEGORY_TERRITORY", properties:"HAS_CATEGORY", direction: IN)
connect:                [Connect]       @relationship(type: "HAS_CATEGORY_CONNECT", properties:"HAS_CATEGORY", direction: IN)
categoryTask:           [Task] @cypher(statement: """
                        Match(this)--(t:Task)
                        Return distinct t
                                  """)

}

interface HAS_CATEGORY {
  subcategoryID:                  ID
  date:                           DateTime @ timestamp
  zip:                            String
  territory:                      String
  category:                       String
  subcategory:                    String
  business_type:                  String
  day:                            Int
  month:                          Int
  week:                           Int
  year:                           Int
  ordinalDay:                     Int
  task_description:               String
}

type Classification {
  classificationID:               ID @id
  classification:                 String
  business_type:                  [BusinessType]  @relationship(type: "HAS_CLASSIFICATION_BUSINESSTYPE", direction: OUT)

}

type Connect {
connectID:                        ID @id
date_create:                      DateTime @timestamp
date_task_create:                 Date
task:                             String
homeID:                           ID
taskID:                           ID
supplierID:                       ID
zip:                              ID
territoryID:                      ID
subcategoryID:                    ID
businessTypeID:                   ID
categoryID:                       ID
dayID:                            ID
weekID:                           ID
monthID:                          ID
yearID:                           ID  
task_description:                 String
timeline:                         String
is_active:                        Boolean
date:                             Date
year:                             Int
month:                            Int
day:                              Int
fee:                              Int
createdAt:                        DateTime
availibility:                     String
note:                             String
tasks:                            [Task]            @relationship(type: "HAS_CONNECT_TASK", properties:"HAS_TASK", direction: OUT)
zips:                             [Zip]             @relationship(type: "HAS_CONNECT_ZIP", properties:"HAS_ZIP", direction: OUT)
homes:                            [Home]            @relationship(type: "HAS_CONNECT_HOME", properties:"HAS_HOME",direction: IN)
suppliers:                        [Supplier]        @relationship(type: "HAS_CONNECT_SUPPLIER", properties:"HAS_SUPPLIER_CONNECT", direction: IN)
supplier_info:                    [SupplierInfo]    @relationship(type: "HAS_CONNECT_SUPPLIERINFO", properties:"HAS_SUPPLIER_CONNECT", direction: IN)
invites:                          [Invite]          @relationship(type: "HAS_CONNECT_INVITE", properties:"HAS_CONNECT",direction: IN)
days:                             [Day]             @relationship(type: "HAS_CONNECT_DAY", direction: IN, properties:"HAS_DAY")
weeks:                            [Week]            @relationship(type: "HAS_CONNECT_WEEK", direction: IN, properties:"HAS_WEEK")
months:                           [Month]           @relationship(type: "HAS_CONNECT_Month", direction: IN, properties:"HAS_MONTH")
todays:                           [Today]           @relationship(type: "HAS_CONNECT_TODAY", direction: IN)
category:                         [Category]        @relationship(type: "HAS_CONNECT_CATEGORY", direction: IN, properties:"HAS_CATEGORY")
subcategory:                      [Subcategory]     @relationship(type: "HAS_CONNECT_SUBCATEGORY", direction: IN, properties:"HAS_SUBCATEGORY")
territory:                        [Territory]       @relationship(type: "HAS_CONNECT_TERRITORY", properties:"HAS_TERRITORY",direction: IN)
count_invites:                    Int
                                  @cypher(
                                  statement: "MATCH (this)--(i:Invite) return count(i)  "
                                    )
inviteSupplierID:                 String
                                  @cypher(
                                  statement: "MATCH (this)--(i:Invite) return distinct i.supplierID  "
                                    )
connectAccept:                    [Accept] @cypher(statement: """
                                  Match(this)--(a:Accept)
                                  Return distinct a
                                  """)
}

interface HAS_CONNECT {
connectID:                 ID @id
supplierID:                ID
taskID:                    ID

}


type Event_Home {
  event_homeID:                   ID @id
  date_create:                    DateTime @timestamp
  homeID:                         ID
  bannerPlacementUID:             ID
  promoPlacementUID:              ID
  bannerUID:                      ID
  promoUID:                       ID
  offeringUID:                    ID
  territoryID:                    ID
  itemID:                         ID
  subcategoryID:                  ID
  categoryID:                     ID
  zipID:                          ID
  todayID:                        ID
  dayID:                          ID
 
  action:                         String
  homes:                          [Home]               @relationship(type: "HAS_EVENTHOME_HOME_EVENT",direction: OUT)
  banner_placements:              [Banner_Placement]   @relationship(type: "HAS_BANNERPLACEMENT_HOME_EVENT",direction: IN)
  promo_placements:               [Promo_Placement]    @relationship(type: "HAS_PROMOPLACEMENT_HOME_EVENT",direction: IN)
  banners:                        [Banner]             @relationship(type: "HAS_BANNER_HOME_EVENT",direction: IN)
  promos:                         [Promo]              @relationship(type: "HAS_PROMO_HOME_EVENT",direction: IN)
 
  territories:                    [Territory]          @relationship(type: "HAS_TERRITORY_HOME_EVENT",direction: IN)
  items:                          [Item]               @relationship(type: "HAS_ITEM_HOME_EVENT",direction: IN)
  subcategories:                  [Subcategory]        @relationship(type: "HAS_SUBCATEGORY_HOME_EVENT",direction: OUT)
  categories:                     [Category]           @relationship(type: "HAS_CATEGORY_HOME_EVENT",direction: OUT)
  zips:                           [Zip]                @relationship(type: "HAS_ZIP_HOME_EVENT",direction: IN)
  todays:                         [Today]              @relationship(type: "HAS_TODAY_HOME_EVENT",direction: IN)
  days:                           [Day]                @relationship(type: "HAS_DAY_HOME_EVENT",direction: IN)
 
}

type Event_Home_Category {
  event_home_categoryID:          ID @id
  date_create:                    DateTime @timestamp
  homeID:                         ID
  offeringUID:                    ID
  territoryID:                    ID
  categoryID:                     ID
  zipID:                          ID
  todayID:                        ID
  dayID:                          ID
  action:                         String
  homes:                          [Home]               @relationship(type: "HAS_EVENTHOME_HOME_CATEGORY_EVENT",direction: OUT)
  territories:                    [Territory]          @relationship(type: "HAS_TERRITORY_HOME_CATEGORY_CATEGORYEVENT",direction: IN)
  categories:                     [Category]           @relationship(type: "HAS_CATEGORY_HOME_CATEGORY_EVENT",direction: OUT)
  zips:                           [Zip]                @relationship(type: "HAS_ZIP_HOME__CATEGORY_EVENT",direction: IN)
  todays:                         [Today]              @relationship(type: "HAS_TODAY_HOME_CATEGORY_EVENT",direction: IN)
  days:                           [Day]                @relationship(type: "HAS_DAY_HOME_CATEGORY_EVENT",direction: IN)
 
}

type Explore {
  exploreID:                      ID @id
  createdAt:                      DateTime    @timestamp
  supplierID:                     ID
  supplierUID:                    ID
  is_active:                      Boolean
  supplier:                       [Supplier]             @relationship(type: "HAS_EXPLORE_SUPPLIER", direction: IN)
  territory:                      [Territory]            @relationship(type: "HAS_EXPLORE_TERRITORY", properties:"HAS_TERRITORY", direction: OUT)
  business_type:                  [BusinessType]         @relationship(type: "HAS_EXPLORE_BUSINESSTYPE", properties:"HAS_BUSINESSTYPE", direction: OUT)
}

type Fee {
feeID:                  ID @id
amount:                 Float
subcategory:            [Subcategory]          @relationship(type: "HAS_FEE_SUBCATEGORY", properties:"HAS_SUBCATEGORY", direction: IN)
}

type Home {
homeID:                 ID @id
uuid:                   Int
uid:                    ID
is_active:              Boolean
email:                  String
password:               String
username:               String
home_address:           [HomeAddress] @relationship(type: "HAS_HOME_HOMEADDRESS", direction: OUT)
home_info:              [HomeInfo]    @relationship(type: "Has_Home_HomeInfo", direction: OUT)
home_type:              [HomeType]    @relationship(type: "Has_Home_HomeType", direction: OUT)
zip:                    [Zip]         @relationship(type: "Has_Home_Zip", properties:"Zips", direction: OUT)
tasks:                  [Task]        @relationship(type: "HAS_TASK", properties:"HAS_TASK", direction: OUT)
homeZip:                [Zip] @cypher(statement: """
                                  Match(this)--(z:Zip)
                                  Return distinct z
                                  """)
homeAddress:            [HomeAddress] @cypher(statement: """
                                  Match(this)--(h:HomeAddress)
                                  Return distinct h
                                  """)
homeInfo:               [HomeInfo] @cypher(statement: """
                                  Match(this)--(hi:HomeInfo)
                                  Return distinct hi
                                  """)
homeTodo:               [Todo] @cypher(statement: """
                                  Match(this)--(t:Todo)
                                  Return distinct t
                                  """)
}

interface HAS_HOME {
homeID:                 ID @id
uuid:                   Int
uid:                    ID
is_active:              Boolean
email:                  String
password:               String
username:               String



}

type HomeAddress {
homeAddressID:          ID @id
uid:                    ID
address_name:           String
street_number:          String
street:                 String
city:                   String
state:                  String
zip:                    String
home:                   [Home]     @relationship(type: "Has_HomeAddress_Home", direction: IN)
zips:                    [Zip]      @relationship(type: "HAS_HOMEADDRESS_ZIP", direction: IN)  
}

type HomeInfo {
homeInfoID:             ID @id
homeID:                 ID
uid:                    ID
name_first:             String
name_last:              String
home:                   [Home]      @relationship(type: "Has_HomeInfo_Home", direction: OUT) 
}

type HomeType {
hometypeID:             ID @id
uid:                    ID
home_type:              String
name_last:              String
home:                   [Home]      @relationship(type: "Has_HomeTyp_Home", direction: OUT) 
}

type HomeZip {
homeZipID:              ID @id
zip:                    String
home:                   [Home]      @relationship(type: "Has_HomeZip_Home", direction: OUT) 
}

type Invite {
inviteID:                         ID @id
date_create:                      DateTime @timestamp
task:                             String
homeID:                           ID
taskID:                           ID
supplierID:                       ID
categoryID:                       ID
territoryID:                      ID
subcategoryID:                    ID
connectID:                        ID
zip:                              ID

dayID:                            ID
weekID:                           ID
monthID:                          ID
yearID:                           ID
description:                      String
timeline:                         String
is_active:                        Boolean
schedule:                         String
note_to_supplier:                 String
date:                             Date
year:                             Int
month:                            Int
day:                              Int
fee:                              Int
createdAt:                        DateTime
tasks:                            [Task]            @relationship(type: "HAS_INVITE_TASK", properties:"HAS_TASK", direction: OUT)
homes:                            [Home]            @relationship(type: "HAS_INVITE_HOME", properties:"HAS_HOME",direction: IN)
suppliers:                        [Supplier]        @relationship(type: "HAS_INVITE_SUPPLIER", properties:"HAS_SUPPLIER_CONNECT", direction: IN)
supplier_info:                    [SupplierInfo]    @relationship(type: "HAS_INVITE_SUPPLIERINFO", properties:"HAS_SUPPLIER_CONNECT", direction: IN)
connects:                         [Connect]         @relationship(type: "HAS_INVITE_CONNECT", properties:"HAS_CONNECT", direction: OUT)
days:                             [Day]             @relationship(type: "HAS_INVITE_DAY", direction: IN, properties:"HAS_DAY")
weeks:                            [Week]            @relationship(type: "HAS_INVITE_WEEK", direction: IN, properties:"HAS_WEEK")
months:                           [Month]           @relationship(type: "HAS_INVITE_Month", direction: IN, properties:"HAS_MONTH")
todays:                           [Today]           @relationship(type: "HAS_INVITE_TODAY", direction: IN)
category:                         [Category]        @relationship(type: "HAS_INVITE_CATEGORY", direction: IN, properties:"HAS_CATEGORY")
subcategory:                      [Subcategory]     @relationship(type: "HAS_INVITE_SUBCATEGORY", direction: IN, properties:"HAS_SUBCATEGORY")
territory:                        [Territory]       @relationship(type: "HAS_INVITE_TERRITORY", properties:"HAS_TERRITORY",direction: IN)
accepts:                          [Accept]          @relationship(type: "HAS_INVITE_ACCEPT", direction: OUT)
inviteTask:                       [Task] @cypher(statement: """
                                  Match(this)--(t:Task)
                                  Return distinct t
                                  """)
inviteItem:                       [Item] @cypher(statement: """
                                  Match(this)--(t:Task)--(i:Item)
                                  Return distinct i
                                  """)
inviteCategory:                   [Category] @cypher(statement: """
                                  Match(this)--(t:Task)--(c:Category)
                                  Return distinct c
                                  """)
inviteSubcategory:                [Subcategory] @cypher(statement: """
                                  Match(this)--(t:Task)--(s:Subcategory)
                                  Return distinct s
                                  """)
inviteTerritory:                 [Territory] @cypher(statement: """
                                  Match(this)--(t:Task)--(t:Territory)
                                  Return distinct t
                                  """)
inviteZip:                        [Zip] @cypher(statement: """
                                  Match(this)--(t:Task)--(z:Zip)
                                  Return distinct z
                                  """)
inviteFee:                        [Fee] @cypher(statement: """
                                  Match(this)--(t:Task)--(s:Subcategory)--(f:Fee)
                                  Return distinct f 
                                  """)
inviteAccept:                     [Accept] @cypher(statement: """
                                  Match(this)--(a:Accept)
                                  Return distinct a 
                                  """)
inviteHome:                       [Home] @cypher(statement: """
                                  Match(this)--(h:Home)
                                  Return distinct h         
                                  """)
inviteSupplier:                   [Supplier] @cypher(statement: """
                                  Match(this)--(s:Supplier)
                                  Return distinct s         
                                  """)
acceptSupplierID:                 String
                                  @cypher(
                                  statement: "MATCH (this)--(a:Accept) return distinct a.supplierID  "
                                    )
inviteSupplierID:                 String
                                  @cypher(
                                  statement: "MATCH (this)--(i:Invite) return distinct i.supplierID  "
                                    )

}

type Item {
  itemID:               ID @id
  item:                 String
  image_path:           String
  subcategory:          [Subcategory] @relationship(type: "HAS_ITEM_SUBCATEGORY", direction: OUT)
  itemSubcategory:      [Subcategory] @cypher(statement: """
                        Match(this)--(s:Subcategory)
                        Return distinct s
                                  """)
  itemCategory:         [Category] @cypher(statement: """
                        Match(this)--(s:Subcategory)--(c:Category)
                        Return distinct c
                                  """)
  itemBusinessType:     [BusinessType] @cypher(statement: """
                        Match(this)--(s:Subcategory)--(c:Category)--(b:BusinessType)
                        Return distinct b
                                  """)
  itemTask:          [Task] @cypher(statement: """
                        Match(this)--(t:Task)
                        Return distinct t
                                  """)
                    

}





type Mysubscription  {
  subscriptionID:                 ID @id
  planID:                         ID
  baseID:                         ID
  supplierID:                     ID
  supplierUID:                    ID
  uid:                            ID
  date_create:                    DateTime @timestamp
  is_active:                      Boolean
  worksheet:                      [Worksheet]   @relationship(type: "HAS_MYSUBSCRIPTION_WORKSHEET", direction: OUT)
  plan:                           [Plan]        @relationship(type: "HAS_MYSUBSCRIPTION_Plan", direction: OUT)
  supplier:                       [Supplier]    @relationship(type: "HAS_MYSUBSCIPTION_SUPPLIER", direction: IN)
  base:                           [Base]        @relationship(type: "HAS_MYSUBSCIPTION_BASE", direction: OUT)
  subscriptionBase:               [Base] @cypher(statement: """
                                  Match(this)--(b:Base)
                                  Return distinct b
                                  """)
}

type Plan {
planID:                 ID  @id
plan_number:            String
description:            String
code:                   String
territory:              Int
business_type:          Int
amount:                 Float
date_create:            DateTime @timestamp
is_active:              Boolean

}

interface HAS_PLAN {
planID:                 ID  @id
description:            String
code:                   String
territory:              Int
business_type:          Int
amount:                 Float
}
type Sub {

subID:                  ID @id
subcategoryID:          ID
subcategory:            String
slug:                   String
description:            String
image_path:             String
image_path_header:      String
cat:                    [Cat]       @relationship(type: "HAS_SUBCATEGORY_CATEGORY_new", direction: OUT)
}

type Subcategory {

subcategoryID:          ID @id
subcategory:            String
slug:                   String
description:            String
image_path:             String
image_path_header:      String
category:               [Category] @relationship(type: "HAS_SUBCATEGORY_CATEGORY", direction: IN)
item:                   [Item]     @relationship(type: "HAS_SUBCATEGORY_ITEM",     direction: IN)
tasks:                  [Task]     @relationship(type: "HAS_SUBCATEGORY_TASK",     properties:"HAS_SUBCATEGORY", direction: IN)
connect:                [Connect]  @relationship(type: "HAS_SUBCATEGORY_CONNECT",  properties:"HAS_SUBCATEGORY", direction: IN)
fee:                    [Fee]      @relationship(type: "HAS_SUBCATEGORY_FEE",      properties:"HAS_SUBCATEGORY", direction: IN)
subcategoryFee:         [Fee] @cypher(statement: """
                        Match(this)--(f:Fee)
                        Return distinct f
                                  """)
}

interface HAS_SUBCATEGORY {
  subcategoryID:                  ID
  date:                           DateTime @ timestamp
  zip:                            String
  territory:                      String
  category:                       String
  subcategory:                    String
  business_type:                  String
  day:                            Int
  month:                          Int
  week:                           Int
  year:                           Int
  ordinalDay:                     Int
  task_description:               String


}

type Supplier {
  supplierID:                     ID   @id
  uuid:                           Int
  name_first:                     String
  name_last:                      String
  uid:                            ID
  email:                          String
  password:                       String
  username:                       String      
  date_create:                    DateTime        @timestamp
  is_active:                      Boolean
  territory:                      [Territory]       @relationship(type: "HAS_SUPPLIER_TERRITORY", properties:"HAS_TERRITORY", direction: OUT)
  business_type:                  [BusinessType]    @relationship(type: "HAS_SUPPLIER_BUSINESSTYPE", properties:"HAS_BUSINESSTYPE", direction: OUT)
  supplier_info:                  [SupplierInfo]    @relationship(type: "HAS_SUPPLIER_SUPPLIERINFO", properties:"HAS_SUPPLIER_CONNECT", direction: OUT)
  supplier_phone:                 [SupplierPhone]   @relationship(type: "HAS_SUPPLIER_SUPPLIERPHONE", properties:"HAS_SUPPLIER_CONNECT", direction: OUT)
  supplier_address:               [SupplierAddress] @relationship(type: "HAS_SUPPLIER_SUPPLIERADDRESS", properties:"HAS_SUPPLIER_CONNECT", direction: OUT)
  supplier_license:               [SupplierLicense] @relationship(type: "HAS_SUPPLIER_SUPPLIERLICENSE", properties:"HAS_SUPPLIER_CONNECT", direction: OUT)
  mysubscription:                 [Mysubscription]  @relationship(type: "HAS_SUPPLIER_MYSUBSCRIPTION", direction: OUT)
  explore:                        [Explore]         @relationship(type: "HAS_SUPPLIER_EXPLORE", direction: OUT)
  

  count_invites:          Int
                          @cypher(
                          statement: "MATCH (this)--(i:Invite) return count(i)  "
                                    )
  count_connect:          Int
                          @cypher(
                          statement: "MATCH (this)--(c:Connect) return count(c)  "
                                    )
  count_accept:          Int
                          @cypher(
                          statement: "MATCH (this)--(a:Accept) return count(a)  "
                                    )
  count_base:             Int
                          @cypher(
                          statement: "MATCH (this)--(b:Base) return count(b)  "
                                    )
  count_territory:        Int
                          @cypher(
                          statement: "MATCH (this)--(b:Base)--(t:Territory) return count(t)  "
                                    )
  count_business_type:    Int
                          @cypher(
                          statement: "MATCH (this)--(b:Base)--(bt:BusinessType) return count(bt)  "
                                    )
  count_subscription:     Int
                          @cypher(
                          statement: "MATCH (this)--(b:Base)--(m:Mysubscription) return count(m)  "
                                    )
  count_subscription_plan:   Int
                          @cypher(
                          statement: "MATCH (this)--(b:Base)--(m:Mysubscription)--(p:Plan) return count(p)  "
                                    )

userTasks:                      [Task] @cypher(statement: """
match(this:Supplier) With this Match(this:Supplier)--(b:Base)--(t:Territory) With this,b,t Match(this:Supplier)--(b:Base)--(bt:BusinessType) With this,t,b,bt Match(bt)--(ta:Task)--(t:Territory) return ta
                                  """)

newTasks:                      [Task] @cypher(statement: """
match(t:Task)--(b:BusinessType)—-(this) 
WITH t,b,this
MATCH (t:Task)
WHERE NOT (t)-[:HAS_CONNECT_TASK]-()

return t
,
                                  """)
  userInvites:        [Invite] @cypher(statement: """
                        Match(this)--(i:Invite)
                        Return distinct i
                                  """)
  userConnects:        [Connect] @cypher(statement: """
                        Match(this)--(c:Connect)
                        Return distinct c
                                  """)
  userAccepts:        [Accept] @cypher(statement: """
                        Match(this)--(a:Accept)
                        Return distinct a

                                  """)
supplierSupplierInfo:   [SupplierInfo] @cypher(statement: """
                        Match(this)--(s:SupplierInfo)
                        Return distinct s
                                  """)

supplierSupplierPhone:[SupplierPhone] @cypher(statement: """
                        Match(this)--(p:SupplierPhone)
                        Return distinct p
                                  """)

supplierSupplierAddress:[SupplierAddress] @cypher(statement: """
                        Match(this)--(a:SupplierAddress)
                        Return distinct a
                                  """)

supplierSupplierLicense:[SupplierLicense] @cypher(statement: """
                        Match(this)--(l:SupplierLicense)
                        Return distinct l
                                  """)
supplierSubscription:   [Mysubscription] @cypher(statement: """
                        Match(this)--(m:Mysubscription)
                        Return distinct m
                                  """)
subscriptionTasks:      [Task] @cypher(statement: """
                        match(this)--(ba:Base)
                        With ba
                        match(ba:Base)--(ter:Territory)
                        With ter,ba
                        Match(ba)--(b:BusinessType)
                        With ter,b
                        Match(b)--(t:Task)--(ter)
                        RETURN t
                                  """)
subscriptionBusinessType:[BusinessType] @cypher(statement: """
                        match(this)--(ba:Base)
                        With ba
                        match(ba:Base)--(ter:Territory)
                        With ter,ba
                        Match(ba)--(b:BusinessType)
                        RETURN b
                                  """)
subscriptionTerritory:  [Territory] @cypher(statement: """
                        match(this)--(ba:Base)
                        With ba
                        match(ba:Base)--(ter:Territory)
                        RETURN ter
                                  """)
subscriptionCategory:  [Category] @cypher(statement: """
                        match(this)--(ba:Base)
                        With ba
                        match(ba:Base)--(ter:Territory)
                        With ter,ba
                        Match(ba)--(b:BusinessType)
                        With ter,b
                        Match(b)--(t:Task)--(ter)
                        With (t)
                        Match(t)--(c:Category)
                        RETURN c
                                  """)
subscriptionSubcategory:[Subcategory] @cypher(statement: """
                        match(this)--(ba:Base)
                        With ba
                        match(ba:Base)--(ter:Territory)
                        With ter,ba
                        Match(ba)--(b:BusinessType)
                        With ter,b
                        Match(b)--(t:Task)--(ter)
                        With (t)
                        Match(t)--(s:Subcategory)
                        RETURN s
                                  """)
subscriptionItem:       [Item] @cypher(statement: """
                        match(this)--(ba:Base)
                        With ba
                        match(ba:Base)--(ter:Territory)
                        With ter,ba
                        Match(ba)--(b:BusinessType)
                        With ter,b
                        Match(b)--(t:Task)--(ter)
                        With (t)
                        Match(t)--(i:Item)
                        RETURN i
                                  """)
subscriptionConnect:    [Connect] @cypher(statement: """
                        match(this)--(ba:Base)
                        With ba
                        match(ba:Base)--(ter:Territory)
                        With ter,ba
                        Match(ba)--(b:BusinessType)
                        With ter,b
                        Match(b)--(t:Task)--(ter)
                        With t
                        match(t)--(c:Connect)
                        RETURN c
                                  """)
supplierBase:           [Base] @cypher(statement: """
                        Match(this)--(b:Base)
                        Return distinct b
                                  """)
  
  
}

type SupplierAddress  {
  supplieraddressID:              ID @id
  supplierID:                     ID
  uid:                            ID
  address:                        String
  suite:                          String
  city:                           String
  county:                         String
  state:                          String
  zip:                            String
  date_create:                    DateTime     @timestamp
  suppliers:                      [Supplier]   @relationship(type: "HAS_SUPPLIER_ADDRESS_SUPPLIER", properties:"HAS_SUPPLIER_CONNECT", direction: IN)
  zips:                           [Zip]        @relationship(type: "HAS_SUPPLIERADDRESS_ZIP", direction: IN) 
  supplier_info:                  [SupplierInfo]    @relationship(type: "HAS_SUPPLIERADDRESS_SUPPLIERINFO", properties:"HAS_SUPPLIER_CONNECT", direction: OUT) 
}

type SupplierInfo {
  supplierinfoID:                 ID @id
  supplierID:                     ID
  uid:                            ID
  company:                        String
  founded:                        Int
  employee:                       Int 
  tagline:                        String
  base_location:                  String
  bio:                            String
  url:                            String
  insurance:                      Boolean
  license:                        Boolean
  date_create:                    DateTime        @timestamp
  suppliers:                      [Supplier]      @relationship(type: "HAS_SUPPLIERINFO_SUPPLIER", properties:"HAS_SUPPLIER_CONNECT", direction: IN)
  supplier_phone:                 [SupplierPhone]   @relationship(type: "HAS_SUPPLIERINFOINFOINFO_SUPPLIERLICENSE", properties:"HAS_SUPPLIER_CONNECT", direction: OUT)
}

type SupplierLicense  {
  supplierlicenseID:              ID @id
  supplierID:                     ID
  uid:                            ID
  license_number:                 String
  county_license:                 String
  state_license:                  String
  date_create:                    DateTime  @timestamp
  suppliers:                      [Supplier]      @relationship(type: "HAS_SUPPLIERLICENSE_SUPPLIER", properties:"HAS_SUPPLIER_CONNECT", direction: IN)
  supplier_info:                  [SupplierInfo]    @relationship(type: "HAS_SUPPLIERLICENSE_SUPPLIERINFO", properties:"HAS_SUPPLIER_CONNECT", direction: OUT)
}

type SupplierPhone  {
  supplierphoneID:                ID @id
  supplierID:                     ID
  uid:                            ID
  phone_type:                     String
  phone_number:                   String
  date_create:                    DateTime @timestamp
  suppliers:                      [Supplier]      @relationship(type: "HAS_SUPPLIERPHONE_SUPPLIER", properties:"HAS_SUPPLIER_CONNECT", direction: IN)
  supplier_info:                  [SupplierInfo]    @relationship(type: "HAS_SUPPLIERPHONE_SUPPLIERINFO", properties:"HAS_SUPPLIER_CONNECT", direction: OUT)
}

interface HAS_SUPPLIER {
  supplierID:                     ID  @id
  uuid:                           Int
  email:                          String
  password:                       String
  username:                       String      
  date_create:                    DateTime        @timestamp
  is_active:                      Boolean

}

interface HAS_SUPPLIER_CONNECT  {
  supplierID:                     ID
  company:                        String
  founded:                        String
  bio:                            String
  base_location:                  String
  employees:                      Int 
  insurance:                      Boolean
  license:                        Boolean
}

type Task {
  taskID:               ID @id
  task_description:     String
  task_detail:          String
  task_why_now:         String
  date_task:            String
  date_create:          DateTime @timestamp
  is_active:            Boolean
  is_emergency:         Boolean
  town:                 String
  createdAt:            DateTime 
  posted: String @cypher(statement: """
  match(this:Task) With this,DateTime( ) AS now WITH now,this,duration.between(this.date_create,now).weeks as weeks, duration.between(this.date_create,now).days as days, duration.between(this.date_create,now).hours as hours, duration.between(this.date_create,now).minutes as minutes, duration.between(this.date_create,now).seconds as seconds With this,minutes,hours,days,weeks,seconds, CASE WHEN days > 7 and weeks = 1 THEN weeks + ' Week Ago' WHEN days > 7  THEN weeks + ' Weeks Ago' WHEN hours > 24 THEN days+' Days Ago' WHEN minutes >  60 THEN hours+' Hours Ago' WHEN minutes > 1 < 60  THEN minutes+' Minutes Ago' WHEN seconds < 1 THEN minutes+' Minute Ago' WHEN seconds < 59 THEN seconds +' Seconds Ago' WHEN minutes > 60 THEN hours+' Hours Ago' ELSE days END AS Posted return Posted 
                 """)
  homeID:               ID
  homeUID:              ID
  itemID:               ID
  zipID:                ID
  territoryID:          ID
  categoryID:           ID
  subcategoryID:        ID
  actionID:             ID
  businessTypeID:       ID
  dayID:                ID
  weekID:               ID
  monthID:              ID
  yearID:               ID    
  day:                  Int 
  week:                 Int
  month:                Int 
  year:                 Int 
  ordinalDay:           Int
  quarter:              Int
  action:               String
  years_old:            String
  make_model:           String
  todoUID:              ID
  actionTask:           [ActionTask]     @relationship(type: "HAS_ACTION_ASK",direction: IN)
  homes:                [Home]           @relationship(type: "HAS_TASK", properties:"HAS_TASK",direction: IN)
  subcategory:          [Subcategory]    @relationship(type: "HAS_SUBCATEGORY", properties:"HAS_SUBCATEGORY",direction: IN)
  item:                 [Item]           @relationship(type: "HAS_TASK_ITEM", properties:"HAS_SUBCATEGORY",direction: IN)
  category:             [Category]       @relationship(type: "HAS_CATEGORY", properties:"HAS_CATEGORY",direction: OUT)
  territory:            [Territory]      @relationship(type: "HAS_TASK_TERRITORY", properties:"HAS_TERRITORY",direction: IN)
  zip:                  [Zip]            @relationship(type: "HAS_TASK_ZIP", properties:"HAS_ZIP",direction: IN)
  business_type:        [BusinessType]   @relationship(type: "HAS_TASK_BUSINESSTYPE", properties:"HAS_BUSINESSTYPE",direction: OUT)
  connects:             [Connect]        @relationship(type: "HAS_TASK_CONNECT", properties:"HAS_TASK", direction: OUT)
  invites:              [Invite]         @relationship(type: "HAS_TASK_INVITE", properties:"HAS_TASK", direction: IN)
  years:                [Year]           @relationship(type: "HAS_TASK_YEAR", direction: IN)
  days:                 [Day]            @relationship(type: "HAS_TASK_DAY", direction: IN, properties:"HAS_DAY")
  weeks:                [Week]           @relationship(type: "HAS_TASK_Week", direction: IN, properties:"HAS_WEEK")
  months:               [Month]          @relationship(type: "HAS_TASK_MONTH", direction: IN, properties:"HAS_MONTH")
  todays:               [Today]          @relationship(type: "HAS_TASK_TODAY", direction: IN)
  todo:                 [Todo]           @relationship(type: "HAS_TASK_TODO", direction: IN)


  taskSuppliers:        [Supplier]       @cypher(statement: """
  Match(this)—-(c:Category)
                        With this, c
                        Match (this)—-(ter:Territory)
                        With this,c,ter
                        Match (t)--(c)--(bt:BusinessType)--(b:Base)--(s:Supplier)
                        Return distinct s 
                                  """)

  taskConnects:        [SupplierInfo] @cypher(statement: """
                        Match(this)--(connect:Connect)--(supplier:SupplierInfo)
                        Return distinct supplier
                                  """)

  taskInvites:        [SupplierInfo] @cypher(statement: """
                        match(this)--(i:Invite)--(sup:Supplier)--(s:SupplierInfo)return s
                                  """)
  mytaskConnects:        [Connect] @cypher(statement: """
                        Match(this)--(connect:Connect)
                        Return distinct connect
                                  """)
  connectSupplierID:     String
                          @cypher(
                          statement: "MATCH (this)--(c:Connect) return distinct c.supplierID  "
                                    )
  count_invites:          Int
                          @cypher(
                          statement: "MATCH (this)--(i:Invite) return count(i)  "
                                    )
  count_connect:          Int
                          @cypher(
                          statement: "MATCH (this)--(c:Connect) return count(c)  "
                                    )
  count_accept:          Int
                          @cypher(
                          statement: "MATCH (this)--(a:Accept) return count(a)  "
                                    )
  taskItem:             [Item] @cypher(statement: """
                        Match(this)--(i:Item)
                        Return distinct i
                                  """)
  taskCategory:         [Category] @cypher(statement: """
                        Match(this)--(c:Category)
                        Return distinct c
                                  """)
  taskSubcategory:     [Subcategory] @cypher(statement: """
                        Match(this)--(s:Subcategory)
                        Return distinct s
                                  """)
  taskZip:             [Zip] @cypher(statement: """
                        Match(this)--(z:Zip)
                        Return distinct z
                                  """)
  taskAccept:          [Accept] @cypher(statement: """
                        Match(this)--(a:Accept)
                        Return distinct a
                                  """)
  taskTodo:           [Todo] @cypher(statement: """
                        Match(this)--(t:Todo)
                        Return distinct t
                                  """)

  

  
}

interface HAS_TASK {
  homeID:                         ID
  date:                           DateTime @ timestamp
  zip:                            String
  territory:                      String
  category:                       String
  subcategory:                    String
  business_type:                  String
  task_description:               String



}

type Territory {
territoryID:            ID @id
territory_number:       Int
territory:              String
county:                 String
state:                  String
business_type:          [BusinessType] @relationship(type: "HAS_TERRITORY_BUSINESSTYPE", direction: OUT)
zip:                    [Zip] @relationship(type: "HAS_TERRITORY_ZIP",properties:"HAS_ZIP", direction: OUT)
classification:         [Classification] @relationship(type: "HAS_TERRITORY_CLASSIFICATION", direction: OUT)
tasks:                  [Task] @relationship(type: "HAS_TERRITORY_TASK", properties:"HAS_TERRITORY", direction: IN)
category:               [Category] @relationship(type: "HAS_TERRITORY_CATEGORY", properties:"HAS_CATEGORY", direction: IN)
supplier:               [Supplier] @relationship(type: "HAS_TERRITORY_SUPPLIER", properties:"HAS_TERRITORY", direction: OUT)
count_business_type:    Int
                                  @cypher(
                                  statement: "MATCH (this)--(b:BusinessType) return count(b)  "
                                    )
count_zip:    Int
                                  @cypher(
                                  statement: "MATCH (this)--(z:Zip) return count(z)  "
                                    )
territoryBusinessType:  [BusinessType] @cypher(statement: """
                        Match(this)--(b:BusinessType)
                        Return distinct b
                                  """)
territoryCategory:      [Category] @cypher(statement: """
                        Match(this)--(b:BusinessType)--(c:Category)
                        Return distinct c
                                  """)
territoryTask:          [Task] @cypher(statement: """
                        Match(this)--(b:BusinessType)--(c:Category)--(t:Task)
                        Return distinct t
                                  """)

  
}
interface HAS_TERRITORY {
  territoryID:                    ID
  date:                           DateTime @ timestamp
  territory:                      String
  zip:                            String
  town:                           String
  business_type:                  String
  category:                       String
  subcategory:                    String
  day:                            Int
  month:                          Int
  week:                           Int
  year:                           Int
  ordinalDay:                     Int
  task_description:               String
}

type Today {
  todayID:                        ID  @id
  test:                           String
  territory_number:               Int
  tasks:                          [Task] @relationship(type: "HAS_TERRITORY_TASK", direction: IN)

  day:                            [Day] @cypher(statement: """
                                  With date({timezone: 'America/New York'})as date
                                  Match(y:Year{year:date.year})--(m:Month{month:date.month})--(day:Day{day:date.day})--(w:Week)
                                  With day
                                  Return day
                                  """)

  dayID:                          String @cypher(statement: """
                                  With date({timezone: 'America/New York'})as date
                                  Match(y:Year{year:date.year})--(m:Month{month:date.month})--(day:Day{day:date.day})--(w:Week)
                                  With day
                                  Return day.dayID
                                  """)
  weekID:                         String @cypher(statement: """
                                  With date({timezone: 'America/New York'})as date
                                  Match(day:Day{day:date.day})--(w:Week{week:date.week})
                                  With day,w
                                  Return w.weekID
                                  """)
  monthID:                        String @cypher(statement: """
                                  With date({timezone: 'America/New York'})as date
                                  Match(day:Day{day:date.day})--(m:Month{month:date.month})
                                  With day,m
                                  Return m.monthID
                                  """)
  yearID:                         String @cypher(statement: """
                                  With date({timezone: 'America/New York'})as date
                                  Match(day:Day{day:date.day})--(m:Month{month:date.month})--(y:Year{year:date.year})
                                  With day,y
                                  Return y.yearID
                                  """)
  month:                          [Month] @cypher(statement: """
                                  With date({timezone: 'America/New York'})as date
                                  Match(y:Year{year:date.year})--(m:Month{month:date.month})--(day:Day{day:date.day})--(w:Week)
                                  With m
                                  Return m
                                  """)
  week:                          [Week] @cypher(statement: """
                                  With date({timezone: 'America/New York'})as date
                                  Match(y:Year{year:date.year})--(m:Month{month:date.month})--(day:Day{day:date.day})--(w:Week)
                                  With w
                                  Return w
                                  """)
  year:                          [Year] @cypher(statement: """
                                  With date({timezone: 'America/New York'})as date
                                  Match(y:Year{year:date.year})--(m:Month{month:date.month})--(day:Day{day:date.day})--(w:Week)
                                  With y
                                  Return y
                                  """)
  date:                          [Date] @cypher(statement: """
                                  With date({timezone: 'America/New York'})as date
                                  Match(y:Year{year:date.year})--(m:Month{month:date.month})--(day:Day{day:date.day})--(w:Week)
                                  With date
                                  Return date
                                  """)

weekly_banner_placement:          [Banner_Placement] @cypher(statement: """
                                  With date({timezone: 'America/New York'})as date
                                  Match(y:Year{year:date.year})--(m:Month{month:date.month})--(day:Day{day:date.day})--(w:Week)--(bp:Banner_Placement)
                                  With bp
                                  Return bp
                                  """)

  weekly_banners:                 [Banner] @cypher(statement: """
                                  With date({timezone: 'America/New York'})as date
                                  Match(y:Year{year:date.year})--(m:Month{month:date.month})--(day:Day{day:date.day})--(w:Week)--(bp:Banner_Placement)--(b:Banner)
                                  With b
                                  Return b
                                  """)
                                  
  
}

interface HAS_TODAY {
dayID:                          String
}

type Todo {
  todoUID:              ID @id
  taskID:               ID 
  bannerPlacementUID:   ID
  promPlacementUID:     ID
  task_description:     String
  task_detail:          String
  task_why_now:         String
  date_task:            String
  date_create:          DateTime @timestamp
  is_active:            Boolean
  is_emergency:         Boolean
  town:                 String
  homeID:               ID
  homeUID:              ID
  itemID:               ID
  zipID:                ID
  territoryID:          ID
  categoryID:           ID
  subcategoryID:        ID
  actionID:             ID
  businessTypeID:       ID
  dayID:                ID
  weekID:               ID
  monthID:              ID
  yearID:               ID    
  day:                  Int 
  week:                 Int
  month:                Int 
  year:                 Int 
  ordinalDay:           Int
  quarter:              Int
  action:               String
  years_old:            String
  make_model:           String
  actionTask:           [ActionTask]     @relationship(type: "HAS_ACTION_ASK_TODO",direction: IN)
  homes:                [Home]           @relationship(type: "HAS_TODO", properties:"HAS_TASK",direction: IN)
  subcategory:          [Subcategory]    @relationship(type: "HAS_SUBCATEGORY_TODO", properties:"HAS_SUBCATEGORY",direction: IN)
  item:                 [Item]           @relationship(type: "HAS_TASK_ITEM_TODO", properties:"HAS_SUBCATEGORY",direction: IN)
  category:             [Category]       @relationship(type: "HAS_CATEGORY_TODO", properties:"HAS_CATEGORY",direction: OUT)
  territory:            [Territory]      @relationship(type: "HAS_TASK_TERRITORY_TODO", properties:"HAS_TERRITORY",direction: IN)
  zip:                  [Zip]            @relationship(type: "HAS_TASK_ZIP_TODO", properties:"HAS_ZIP",direction: IN)
  business_type:        [BusinessType]   @relationship(type: "HAS_TASK_BUSINESSTYPE_TODO", properties:"HAS_BUSINESSTYPE",direction: OUT)
  connects:             [Connect]        @relationship(type: "HAS_TASK_CONNECT_TODO", properties:"HAS_TASK", direction: OUT)
  invites:              [Invite]         @relationship(type: "HAS_TASK_INVITE_TODO", properties:"HAS_TASK", direction: IN)
  years:                [Year]           @relationship(type: "HAS_TASK_YEAR_TODO", direction: IN)
  days:                 [Day]            @relationship(type: "HAS_TASK_DAY_TODO", direction: IN, properties:"HAS_DAY")
  weeks:                [Week]           @relationship(type: "HAS_TASK_Week_TODO", direction: IN, properties:"HAS_WEEK")
  months:               [Month]          @relationship(type: "HAS_TASK_MONTH_TODO", direction: IN, properties:"HAS_MONTH")
  todays:               [Today]          @relationship(type: "HAS_TASK_TODAY_TODO", direction: IN)
  banner_placement:     [Banner_Placement] @relationship(type: "HAS_BANNER_PLACEMENT_TODO", direction: OUT)
  promo_placement:      [Promo_Placement] @relationship(type: "HAS_PROMO_PLACEMENT_TODO", direction: OUT)
  banners:              [Banner]          @relationship(type: "HAS_BANNER_TODO", direction: OUT)
  promos:               [Promo]           @relationship(type: "HAS_PROMO_TODO", direction: OUT)


  
  taskItem:             [Item] @cypher(statement: """
                        Match(this)--(i:Item)
                        Return distinct i
                                  """)
  taskCategory:         [Category] @cypher(statement: """
                        Match(this)--(c:Category)
                        Return distinct c
                                  """)
  taskSubcategory:     [Subcategory] @cypher(statement: """
                        Match(this)--(s:Subcategory)
                        Return distinct s
                                  """)
  taskZip:             [Zip] @cypher(statement: """
                        Match(this)--(z:Zip)
                        Return distinct z
                                  """)
  taskAccept:          [Accept] @cypher(statement: """
                        Match(this)--(a:Accept)
                        Return distinct a
                                  """)
  todoTask:           [Task] @cypher(statement: """
                        Match(this)--(t:Task)
                        Return distinct 
                                  """)

  

  
}

type Zip {
zipID:                  ID @id
uuid:                   Int
town:                   String
county:                 String
state:                  String
zip:                    String
lon:                    Float 
lat:                    Float
territory:              [Territory]     @relationship(type: "HAS_ZIP_TERRITORY", direction: OUT)
home:                   [Home]           @relationship(type: "HAS_ZIP", properties:"Zips", direction: IN)
tasks:                  [Task] @relationship(type: "HAS_ZIP_TASK", properties:"HAS_ZIP", direction: IN)
zipTerritory:           [Territory] @cypher(statement: """
                        Match(this)--(t:Territory)
                        Return distinct t
                                  """)
zipTask:                [Task] @cypher(statement: """
                        Match(this)--(t:Task)
                        Return distinct t
                                  """)
homeAddress:            [HomeAddress] @cypher(statement: """
                                  Match(this)--(h:HomeAddress)
                                  Return distinct 
                                  """)
                                  

}

interface Zips @relationshipProperties {
  zip: String
}

interface HAS_ZIP {
  zipID:                  ID
  town:                   String
  county:                 String
  state:                  String
  zip:                    String
  lon:                    Float 
  lat:                    Float
}

type Worksheet {
  worksheetID :            ID @id
  mysubscriptionID:        ID
  supplierID:              ID
  supplierUID:             ID
  date_create:             DateTime @timestamp
  territory:               [Territory]       @relationship(type: "HAS_WORKSHEET_TERRITORY", properties:"HAS_TERRITORY", direction: OUT)
  business_type:           [BusinessType]    @relationship(type: "HAS_WORKSHEET_BUSINESSTYPE", properties:"HAS_BUSINESSTYPE", direction: OUT)
}
  
type Year {
  yearID:         ID @id
  year:           Int
  month:          [Month] @relationship(type: "HAS_MONTH", direction: OUT)
  week:           [Week] @relationship(type: "HAS_YEAR_WEEK", direction: OUT)
  day:            [Day] @relationship(type: "HAS_YEAR_DAY", direction: OUT)
}

type Month {
  monthID:         ID @id
  month:           Int
  day:             [Day] @relationship(type: "HAS_DAY", direction: OUT)
  days:            [Day] @cypher(statement: """
                                  Match(this)--(d:Day)return d
                                  """)
  tasks:          [Task] @cypher(statement: """
                                  Match(this)--(t:Task)return t
                                  """)
}

interface HAS_MONTH {
  monthID:           ID              
  month:             Int


}

type Week {
  weekID:         ID @id
  week:           Int
  day:            [Day] @relationship(type: "HAS_WEEK", direction: IN, properties:"HAS_WEEK")
  task:           [Task] @relationship(type: "HAS_WEEK_TASK", properties:"HAS_DAY", direction: IN)
  days:           [Day] @cypher(statement: """
                                  Match(this)--(d:Day)return d
                                  """)
  year:           [Year] @cypher(statement: """
                                  Match(this)--(y:Year)return y
                                  """)
  tasks:          [Task] @cypher(statement: """
                                  Match(this)--(t:Task)return t
                                  """)
  banner_placement:[Banner_Placement] @cypher(statement: """
                                  Match(this)--(b:Banner_Placement)return b
                                  """)
  promos_placement:[Promo_Placement] @cypher(statement: """
                                  Match(this)--(p:Promo_Placement)return p
                                  """)
  banners_place:   [Banner_Placement]     @relationship(type: "HAS_BANNERRPLACEMENT_WEEK_BANNERS", direction: OUT)
  promoss_place:   [Promo_Placement]      @relationship(type: "HAS_PROMOPLACEMENT_WEEK_PromosS", direction: OUT)
}

interface HAS_WEEK {
  weekID:           ID              
  week:             Int

}

type Day {
 dayID:           ID @id
  day:            Int
  week:          [Week] @relationship(type: "HAS_WEEK", direction: IN, properties:"HAS_WEEK")
  ordinal_day:   [OrdinalDay] @relationship(type: "HAS_ORDINALDAY", direction: IN)
  next:          [Day] @relationship(type: "NEXT", direction: OUT)
  previous:      [Day] @relationship(type: "NEXT", direction: IN)
  tasks:         [Task] @relationship(type: "HAS_DAY_TASK", properties:"HAS_DAY", direction: IN)
  task_count:    Int
                                    @cypher(
                                     statement: "MATCH (this)--(t:Task) return count(t)"
                                    )
  connect_count: Int
                                    @cypher(
                                     statement: "MATCH (this)--(c:Connect) return count(c)"
                                    )
  invite_count: Int
                                    @cypher(
                                     statement: "MATCH (this)--(i:Invite) return count(i)"
                                    )
  month:        Int
                                    @cypher(
                                     statement: "MATCH (this)--(m:Month) return m.month"
                                    )
  year:        Int
                                    @cypher(
                                      statement: "MATCH (this)--(m:Month)--(y:Year) return y.year"
                                    )
  date:        Date                 @cypher(statement: """
                                    match(this)--(month:Month)--(year:Year)
                                    With this, month, year
                                    WITH date({year: year.year, month: month.month, day:this.day}) AS date
                                    RETURN  date
                                    """)
  dayOfWeek:    Int                 @cypher(statement: """
                                    match(this)--(month:Month)--(year:Year)
                                    With this, month, year
                                    WITH date({year: year.year, month: month.month, day:this.day}) AS date
                                    RETURN  date.dayOfWeek
                                  """)
  weekNumber:    Int                @cypher(statement: """
                                    match(this)--(month:Month)--(year:Year)
                                    With this, month, year
                                    WITH date({year: year.year, month: month.month, day:this.day}) AS date
                                    RETURN  date.week
                                  """)
  tasks_day:                     [Task] @cypher(statement: """
                                  Match(this)--(t:Task)return t
                                  """)

                          
}

interface HAS_DAY {
  dayID:           ID              
  day:             Int

}

type OrdinalDay {
  ordinaldayID:   ID @id
  ordinal_day:    Int
}


type Ad {
  adUID:          ID @id
  adID:           String
  headline:       String
  subheader:      String
  body:           String
  image_path:     String
}

type Banner {
  bannerUID:      ID @id
  bannerID:       String
  headline:       String
  message:        String
  image_path:     String
  subcategory:   [Subcategory]   @relationship(type: "HAS_BANNER_SUBCATEGORY", direction: OUT)
  items:         [Item]          @relationship(type: "HAS_BANNER_ITEM", direction: OUT)
  todos:         [Todo]          @relationship(type: "HAS_BANNER_TODO", direction: OUT)
}

type Banner_Placement {
  bannerPlacementUID: ID @id
  bannerUID:          ID
  bannerID:           String
  territory_number:   Int
  dayID:              ID
  day:                Int
  weekID:             ID
  week:               Int
  month:              Int
  year:               Int
  banners:            [Banner]     @relationship(type: "HAS_BANNERRPLACEMENT_WEEK_BANNERS", direction: OUT)
  weeks:              [Week]       @relationship(type: "HAS_BANNERPLACEMENT_WEEK", direction: IN, properties:"HAS_WEEK")
  todos:              [Todo]       @relationship(type: "HAS_BANNERPLACEMENT_TODO", direction: OUT)
  
  
}

type Promo  {
  promoUID:         ID @id
  promoID:          String
  promotion:        String
  description:      String
  image_path:      String
  offering:       [Offering]     @relationship(type: "HAS_PROMO_OFFERING", direction: OUT)
  todos:              [Todo]       @relationship(type: "HAS_PROMO_TODO", direction: OUT)
}

type Promo_Placement {
  promoPlacementUID: ID @id
  promoUID:          ID
  promoID:           String
  territory_number:  Int
  dayID:             ID
  weekID:             ID
  day:               Int
  week:              Int
  month:             Int
  year:              Int
  promo:            [Promo]     @relationship(type: "HAS_PROMOPLACEMENT_PROMO", direction: OUT)
  weeks:            [Week]       @relationship(type: "HAS_PROMOPLACEMENT_WEEK", direction: IN, properties:"HAS_WEEK")
  todos:            [Todo]       @relationship(type: "HAS_PROMO_PLACEMENT_TODO", direction: OUT)
  
}

type Offering {
  offeringUID:    ID @id
  offering:       String
  offeringID:     String
  description:    String
  image_path:     String
  category:       [Category]     @relationship(type: "HAS_OFFERING_CATEGORY", direction: OUT)
}

`;
const driver = neo4j.driver(
    process.env.NEO4J_URI || "neo4j+s://757b453a.databases.neo4j.io",
    neo4j.auth.basic(
      process.env.NEO4J_USER || "neo4j",
      process.env.NEO4J_PASSWORD || "APu_tOlR0jeooWseb3JNMFHxxAKTfD9inSb4K2I1GcY"
    )
  )

const neoSchema = new Neo4jGraphQL({ typeDefs, driver });

const server = new ApolloServer({
    driverConfig: { database: process.env.NEO4J_DATABASE || 'neo4j' },
    schema: neoSchema.schema,
});
// Specify host, port and path for GraphQL endpoint
const host = process.env.GRAPHQL_SERVER_HOST || '0.0.0.0'
const port = process.env.GRAPHQL_SERVER_PORT || 4003
const path = process.env.GRAPHQL_SERVER_PATH || '/graphql'


server.listen(4003).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
})