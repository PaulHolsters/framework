// administry framework functionality
function model(){

}

function action(){

}

function constraints(){

}

function conditions(){

}

// application made with administry
model
    `
        artikel with props
            artikelnaam: Name as identifier
            immutable keuringstermijn: Period in years gt 0 with default 1
            locatie: Status with values magazijn, leverancier and default magazijn
            gekeurd: Status with values ok, nok and default ok
            laatste gekeurd door: Leverancier.leverancier with default nog nooit gekeurd
            datum laatste keuring: Date with format dd/mm/yyyy with default n.v.t.
    `
model
    `
        immutable leverancier with props
            leverancier: Name as identifier
    `
action
    `
        keuring with props
            artikel: 
                Artikel.artikelnaam with default --selecteer een artikel--
            resultaat with default --selecteer een resultaat--
                alters Artikel: 
                    gekeurd, 
                    datum laatste keuring is Date.today when resultaat is set to ok
            locatie: 
                Status with values naar magazijn, naar leverancier 
                alters Artikel: 
                    locatie with mapping naar magazijn -> magazijn, naar leverancier -> leverancier
            leverancier 
                alters Artikel: 
                    laatst gekeurd door
    `
constraints
    `
        forbid setting Keuring.resultaat to ok 
        when Keuring.locatie is not naar magazijn
        or Keuring.leverancier is nog nooit gekeurd
        or Keuring.artikel not like Artikel.artikelnaam
    `
conditions
    `
    `