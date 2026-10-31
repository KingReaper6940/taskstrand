export const EXAMPLE={title:'Small release',tasks:[
 {id:'A',label:'Confirm scope',minutes:10,needs:[]},
 {id:'B',label:'Build the change',minutes:30,needs:['A']},
 {id:'C',label:'Prepare assets',minutes:15,needs:['A']},
 {id:'D',label:'Review together',minutes:10,needs:['B','C']},
 {id:'E',label:'Ready to ship',minutes:0,needs:['D']}
]};
