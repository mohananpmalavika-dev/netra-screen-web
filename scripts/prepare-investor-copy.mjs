import {readFile,writeFile} from 'node:fs/promises';
// Preserve the established eight-slide structure and local optical artwork.
let js=await readFile('presentation.js','utf8');
const match=js.match(/const COPY = (\[.*?\]);\r?\n/);
const COPY=match?JSON.parse(match[1]):(await import('../investor-copy.mjs')).COPY;
const edits={
 0:['NETRA-SCREEN / TEAM MINDMESH','NETRA-SCREEN / TEAM MINDMESH'],
 1:['Guided eye-movement observation.<br><em>Built around a smartphone.</em>','നേത്രചലന നിരീക്ഷണം.<br><em>നിങ്ങളുടെ സ്മാർട്ട്ഫോണിൽ.</em>'],
 2:['A working Android and web research prototype. Local processing, engaging visual tasks and a clear next research milestone.','Android, വെബ് ഗവേഷണ പ്രോട്ടോടൈപ്പുകൾ. ഉപകരണത്തിലെ പ്രോസസ്സിംഗ്, ദൃശ്യലക്ഷ്യങ്ങൾ, വ്യക്തമായ അടുത്ത ഗവേഷണ ഘട്ടം.'],
 4:['THE FIRST CUSTOMER HYPOTHESIS','ആദ്യ ഉപഭോക്തൃ സാധ്യത'],
 5:['Start with ophthalmology research teams','നേത്രഗവേഷണ സംഘങ്ങളിൽ തുടക്കം'],
 6:['Could guided capture and structured observation reports make supervised eye-movement research easier to run? This is the problem to test with users.','മേൽനോട്ടത്തിലുള്ള നേത്രചലന ഗവേഷണം ലളിതമാക്കാൻ ദൃശ്യലക്ഷ്യങ്ങളും ക്രമപ്പെടുത്തിയ റിപ്പോർട്ടുകളും സഹായിക്കുമോ? ഉപയോക്താക്കളോടൊപ്പം പരിശോധിക്കേണ്ട ചോദ്യമാണിത്.'],
 7:['First user to explore','ആദ്യ ഉപയോക്തൃ സാധ്യത'],
 8:['Ophthalmology researchers running supervised observation tasks. Interviews must establish the actual workflow and unmet need.','മേൽനോട്ടത്തിൽ നിരീക്ഷണ പഠനങ്ങൾ നടത്തുന്ന നേത്രഗവേഷകർ. യഥാർത്ഥ ആവശ്യങ്ങൾ അഭിമുഖങ്ങളിലൂടെ അറിയണം.'],
 9:['Potential buyer','വാങ്ങാൻ സാധ്യതയുള്ളവർ'],
 10:['A research institution or department, if it sees enough value in the workflow. Buyer interest and willingness to pay are untested.','പ്രവർത്തനക്രമത്തിൽ മൂല്യം കണ്ടെത്തുന്ന ഗവേഷണ സ്ഥാപനം അല്ലെങ്കിൽ വിഭാഗം. വാങ്ങാനുള്ള താൽപ്പര്യവും വിലയും പഠിക്കണം.'],
 11:['Expansion to evaluate','പിന്നീട് പഠിക്കാവുന്ന ഉപയോഗം'],
 12:['School and community settings are a later research possibility, subject to appropriate evidence and professional oversight.','സ്കൂൾ, സമൂഹ സാഹചര്യങ്ങളിലെ ഉപയോഗം പിന്നീടുള്ള ഗവേഷണ സാധ്യതയാണ്. തെളിവും വിദഗ്ധ മേൽനോട്ടവും ആവശ്യമാണ്.'],
 13:['Customer and buyer definitions are hypotheses. No signed pilot, paying customer or validated community deployment is claimed.','ഉപഭോക്തൃ നിർവചനങ്ങൾ സാധ്യതകളാണ്. ഒപ്പിട്ട പൈലറ്റോ വരുമാനമോ സമൂഹത്തിലെ സാധുതയോ അവകാശപ്പെടുന്നില്ല.'],
 23:['ENGINEERING EVIDENCE','സോഫ്റ്റ്‌വെയർ തെളിവുകൾ'],
 24:['A demonstrable prototype. An auditable next step.','പ്രവർത്തിക്കുന്ന പ്രോട്ടോടൈപ്പ്. പരിശോധിക്കാവുന്ന അടുത്ത ഘട്ടം.'],
 27:['A local workflow','പ്രാദേശിക പ്രവർത്തനക്രമം'],
 28:['Consent, capture checks, four guided paths and explicit report export. Camera images are not stored or uploaded.','സമ്മതം, ക്യാമറ പരിശോധന, നാല് പാതകൾ, റിപ്പോർട്ട് എക്സ്പോർട്ട്. ക്യാമറ ചിത്രങ്ങൾ സൂക്ഷിക്കുകയോ അപ്‌ലോഡ് ചെയ്യുകയോ ഇല്ല.'],
 29:['Software verification','സോഫ്റ്റ്‌വെയർ പരിശോധന'],
 30:['Automated checks cover core metrics, camera failures, privacy and responsive controls. The partner pack includes a dated evidence card.','പ്രധാന അളവുകൾ, ക്യാമറ പിശകുകൾ, സ്വകാര്യത, സ്ക്രീൻ നിയന്ത്രണങ്ങൾ എന്നിവയ്ക്ക് ഓട്ടോമേറ്റഡ് പരിശോധനകൾ. തീയതിയുള്ള തെളിവ് partner pack-ൽ കാണാം.'],
 31:['Desktop browser tests establish software behavior. Real-phone benchmarks, clinical accuracy and pediatric validity remain unestablished.','ഡെസ്ക്ടോപ്പ് ബ്രൗസർ പരിശോധനകൾ സോഫ്റ്റ്‌വെയർ പ്രവർത്തനം പരിശോധിക്കുന്നു. യഥാർത്ഥ ഫോൺ പ്രകടനവും ക്ലിനിക്കൽ സാധുതയും ഇനിയും സ്ഥാപിക്കണം.'],
 32:['THE PRODUCT CONTRIBUTION','ഉൽപ്പന്നത്തിലെ സംഭാവന'],
 33:['A research workflow around an existing landmark model','നിലവിലുള്ള മോഡലിനെ ചുറ്റിയുള്ള ഗവേഷണ പ്രവർത്തനക്രമം'],
 35:['Guided target paths, framing feedback and explicit camera permission.','ദൃശ്യലക്ഷ്യ പാതകൾ, ക്യാമറ ക്രമീകരണ സഹായം, വ്യക്തമായ അനുമതി.'],
 37:['MediaPipe Face Landmarker is the underlying third-party model; model training is not claimed as our invention.','MediaPipe Face Landmarker ആണ് അടിസ്ഥാന മോഡൽ. മോഡൽ പരിശീലനം സ്വന്തം കണ്ടുപിടിത്തമായി അവകാശപ്പെടുന്നില്ല.'],
 39:['Our integration: paired trajectories, capture checks, experimental metrics and bilingual guidance.','ഞങ്ങളുടെ സംയോജനം: കണ്ണുകളുടെ പാതകൾ, ക്യാമറ പരിശോധന, പരീക്ഷണാത്മക അളവുകൾ, രണ്ടു ഭാഷകളിലെ നിർദേശങ്ങൾ.'],
 42:['Differentiation to test: workflow usability and device performance. Comparative clinical superiority and patent protection are not established.','പരിശോധിക്കേണ്ട പ്രത്യേകതകൾ: ഉപയോഗസൗകര്യവും ഫോൺ പ്രകടനവും. ക്ലിനിക്കൽ മേന്മയോ പേറ്റന്റ് സംരക്ഷണമോ സ്ഥാപിച്ചിട്ടില്ല.'],
 43:['PROPOSED 90-DAY PLAN','നിർദേശിക്കുന്ന 90 ദിവസത്തെ പദ്ധതി'],
 44:['Turn the next support into measurable deliverables','അടുത്ത സഹായത്തിൽ നിന്ന് വ്യക്തമായ ഫലങ്ങൾ'],
 45:['Days 1-30','ദിവസം 1-30'],
 46:['Engineering lead + mentor: define a device matrix, record repeat runs and framing failures, and interview potential research users. Deliver a baseline and interview summary.','സാങ്കേതിക ചുമതലക്കാരനും മെന്ററും: ഫോൺ പട്ടിക, ആവർത്തന പരിശോധന, ക്യാമറ പിശകുകൾ, ഗവേഷക അഭിമുഖങ്ങൾ. ഫലം: അടിസ്ഥാന പ്രകടന റിപ്പോർട്ടും ആവശ്യങ്ങളുടെ സംഗ്രഹവും.'],
 47:['Days 31-60','ദിവസം 31-60'],
 48:['Mentor + prospective clinician: review the workflow and prepare a supervised usability protocol. Deliver a reviewed draft and a costed work plan, subject to partner availability.','മെന്ററും ലഭ്യമാകുന്ന വിദഗ്ധനും: പ്രവർത്തനക്രമ അവലോകനവും മേൽനോട്ടത്തിലുള്ള ഉപയോഗപഠന പദ്ധതിയും. ഫലം: അവലോകനം ചെയ്ത കരടും ചെലവ് കണക്കും.'],
 49:['Days 61-90','ദിവസം 61-90'],
 50:['Team + agreed study partner: run usability work only when the required review, consent and oversight are in place. Deliver findings and a go/revise decision. Otherwise document readiness gaps.','ടീമും പഠന പങ്കാളിയും: ആവശ്യമായ അവലോകനവും സമ്മതവും മേൽനോട്ടവും ലഭിച്ചാൽ ഉപയോഗപഠനം. ഫലം: കണ്ടെത്തലുകളും തുടരണോ മാറ്റണോ എന്ന തീരുമാനവും; അല്ലെങ്കിൽ ശേഷിക്കുന്ന ഒരുക്കങ്ങളുടെ രേഖയും.'],
 51:['Proposed milestones, not commitments. Partner access, study requirements and budget determine timing. Clinical validation is a separate later study.','ഇത് നിർദേശിക്കുന്ന പദ്ധതിയാണ്. പങ്കാളി, പഠന ആവശ്യങ്ങൾ, ബജറ്റ് എന്നിവ സമയത്തെ ബാധിക്കും. ക്ലിനിക്കൽ സാധുതയ്ക്ക് പ്രത്യേക പഠനം വേണം.'],
 52:['COMMERCIAL DISCOVERY','വാണിജ്യ സാധ്യത പഠനം'],
 53:['Test the buyer and value before setting a price','വിലയ്ക്ക് മുമ്പ് ആവശ്യവും മൂല്യവും പഠിക്കാം'],
 54:['Learn the workflow','പ്രവർത്തനക്രമം അറിയുക'],
 55:['Ask research teams how they run and document observations today. Compare setup time, supervision, usable capture and report usefulness.','ഗവേഷകർ ഇപ്പോൾ നിരീക്ഷണം എങ്ങനെ നടത്തുന്നു എന്ന് ചോദിക്കുക. തയ്യാറെടുപ്പ് സമയം, മേൽനോട്ടം, ക്യാമറ ഗുണനിലവാരം, റിപ്പോർട്ട് പ്രയോജനം എന്നിവ താരതമ്യം ചെയ്യുക.'],
 56:['Model to test','പരിശോധിക്കേണ്ട മാതൃക'],
 57:['Institutional software plus onboarding and support is a possible route. Identify the budget owner and measure support costs before proposing a price.','സ്ഥാപനങ്ങൾക്ക് സോഫ്റ്റ്‌വെയർ, പരിശീലനം, പിന്തുണ എന്നിവ സാധ്യതയാണ്. വിലയ്ക്ക് മുമ്പ് ബജറ്റ് ചുമതലക്കാരനെയും പിന്തുണച്ചെലവിനെയും അറിയണം.'],
 58:['What remains open','തീരുമാനിക്കാനുള്ളത്'],
 59:['Customer demand, pricing, market size, unit economics and recurring revenue are unverified. No funding amount or valuation has been decided.','ആവശ്യം, വില, വിപണി വലുപ്പം, വരുമാനം എന്നിവ സ്ഥിരീകരിച്ചിട്ടില്ല. നിക്ഷേപത്തുകയും മൂല്യനിർണയവും തീരുമാനിച്ചിട്ടില്ല.'],
 60:['First commercial evidence: documented user problems, buyer conversations and an agreed next research step.','ആദ്യ വാണിജ്യ തെളിവുകൾ: രേഖപ്പെടുത്തിയ ആവശ്യങ്ങൾ, വാങ്ങുന്നവരുമായുള്ള സംഭാഷണം, സമ്മതിച്ച അടുത്ത ഗവേഷണ ഘട്ടം.'],
 61:['TEAM MINDMESH / THE PARTNERSHIP ASK','MINDMESH / സഹകരണത്തിനുള്ള അഭ്യർഥന'],
 62:['Help us establish the next evidence baseline','അടുത്ത തെളിവുകൾ സൃഷ്ടിക്കാൻ സഹകരിക്കാം'],
 63:['We seek an ophthalmology research collaborator and a supervised usability partner. Next deliverables: a documented device-performance baseline and a clinician-reviewed study plan.','നേത്രഗവേഷണ സഹകാരിയെയും മേൽനോട്ടത്തിലുള്ള ഉപയോഗപഠന പങ്കാളിയെയും തേടുന്നു. അടുത്ത ഫലങ്ങൾ: ഫോൺ പ്രകടന റിപ്പോർട്ടും വിദഗ്ധൻ അവലോകനം ചെയ്ത പഠന പദ്ധതിയും.'],
 64:['Mentor: Aswathy P | TKM Centenary Public School, Kollam | YIP 9.0. Meet the team at the YIP pavilion; agree a follow-up channel in person.','മെന്റർ: Aswathy P | TKM Centenary Public School, കൊല്ലം | YIP 9.0. YIP പവലിയനിൽ ടീമിനെ കാണാം; തുടർബന്ധത്തിനുള്ള മാർഗം നേരിട്ട് തീരുമാനിക്കാം.']
};
for(const [key,[en,ml]] of Object.entries(edits))COPY[Number(key)]={en,ml};
await writeFile('investor-copy.mjs',`// Shared slide copy; rebuild PDFs after changing this file.\nexport const COPY=${JSON.stringify(COPY,null,2)};\n`);
if(match)js=js.replace(match[0],"import {COPY} from './investor-copy.mjs';\n");
await writeFile('presentation.js',js);
let html=await readFile('presentation.html','utf8');
html=html.replace(/(<(span|h2|p|strong|th|td)[^>]*data-pitch="(\d+)"[^>]*>)[\s\S]*?(<\/\2>)/g,(_,open,tag,id,close)=>open+COPY[Number(id)].en+close);
if(!html.includes('href="investor.html"'))html=html.replace('<nav aria-label="Presentation controls">','<nav aria-label="Presentation controls"><a href="investor.html">Partner pack</a>');
html=html.replace('class="pitch-action" href="./index.html#researchSetup">Experience the prototype','class="pitch-action" href="investor.html#connect">Discuss a research partnership');
await writeFile('presentation.html',html);
console.log('Updated eight bilingual investor slides.');
