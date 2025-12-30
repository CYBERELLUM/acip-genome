import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Culminate H Labs 25-year research findings
const genomicsInsights = [
  {
    category: "dna_damage",
    title: "Agricultural Industrialization DNA Impact",
    finding: "The industrialization of agriculture, initiated around 1913, has negatively impacted human DNA through introduction of synthetic chemicals, processed foods, and environmental toxins.",
    mechanism: "Persistent exposure to agrochemicals and processed food derivatives causes epigenetic modifications and direct DNA damage through oxidative stress pathways.",
    implication: "This damage has led to genetic mutations that cause cellular deterioration, contributing to various health issues, premature aging, and diseases.",
    confidence: 0.92,
    years_studied: 25,
    source: "Culminate H Labs Longitudinal Study"
  },
  {
    category: "dna_repair",
    title: "DNA Damage Repair Science Framework",
    finding: "DNA controls disease and aging processes at the fundamental level. By controlling DNA repair mechanisms, we can influence both disease progression and aging trajectories.",
    mechanism: "Targeted intervention at the genetic level can restore proper cellular function by activating endogenous DNA repair pathways including base excision repair (BER), nucleotide excision repair (NER), and homologous recombination.",
    implication: "A complete method to restore wellness at the core biological level through precision genetic and cellular interventions.",
    confidence: 0.89,
    years_studied: 25,
    source: "Culminate H Labs R&D"
  },
  {
    category: "cellular_aging",
    title: "Cellular Deterioration Cascade",
    finding: "Genetic mutations accumulated from environmental and dietary factors trigger a cascade of cellular deterioration affecting mitochondrial function, telomere maintenance, and protein homeostasis.",
    mechanism: "Damaged DNA leads to impaired transcription, producing dysfunctional proteins that accumulate and impair cellular processes, creating a feedback loop of accelerated aging.",
    implication: "Interrupting this cascade at the DNA level provides upstream intervention before downstream damage becomes irreversible.",
    confidence: 0.87,
    years_studied: 25,
    source: "Culminate H Labs Cellular Biology Division"
  },
  {
    category: "nutrigenomics",
    title: "Diet Evolution and Genetic Adaptation",
    finding: "Human genetic adaptation has not kept pace with rapid dietary changes introduced by agricultural industrialization, creating a mismatch between our genome and modern nutrition.",
    mechanism: "Gene-nutrient interactions optimized for ancestral diets are disrupted by modern processed foods, leading to metabolic dysregulation and increased disease susceptibility.",
    implication: "Precision nutrition guided by individual genetic profiles can restore optimal gene expression and cellular function.",
    confidence: 0.91,
    years_studied: 25,
    source: "Culminate H Labs Nutrigenomics Research"
  },
  {
    category: "longevity_genes",
    title: "Longevity Gene Network Identification",
    finding: "A network of interconnected genes controlling lifespan has been identified, including SIRT1-7, FOXO3, AMPK pathway genes, and novel repair-associated transcription factors.",
    mechanism: "These genes regulate cellular stress response, DNA repair efficiency, metabolic homeostasis, and stem cell maintenance - all critical for healthy aging.",
    implication: "Targeted activation of longevity gene networks through precision interventions can extend healthspan and potentially lifespan.",
    confidence: 0.85,
    years_studied: 25,
    source: "Culminate H Labs Longevity Research"
  },
  {
    category: "epigenetics",
    title: "Epigenetic Clock Reversal",
    finding: "Epigenetic modifications accumulated through environmental exposure can be partially reversed through targeted interventions, effectively reducing biological age markers.",
    mechanism: "DNA methylation patterns established by industrial-age exposures can be reprogrammed using specific compounds and lifestyle interventions that activate demethylation enzymes.",
    implication: "Biological age, distinct from chronological age, is modifiable through precision epigenetic interventions.",
    confidence: 0.83,
    years_studied: 20,
    source: "Culminate H Labs Epigenetics Program"
  }
];

const knowledgeBase = [
  {
    topic: "core_philosophy",
    title: "Culminate H Labs Mission",
    content: "From Ancient Wisdom to Precision Health Innovation. Culminate H Labs integrates insights from ancient civilizations with scientific breakthroughs in genetics and cellular biology to develop complete methods for restoring wellness at the core biological level.",
    keywords: ["precision health", "ancient wisdom", "genetics", "cellular biology", "wellness"],
    category: "organizational"
  },
  {
    topic: "research_methodology",
    title: "Longitudinal Research Approach",
    content: "Over 25 years of longitudinal studies and R&D focusing on diet evolution, genetic adaptation, and the impact of modern agricultural practices on human DNA. This extensive research has yielded critical discoveries about DNA damage and repair mechanisms.",
    keywords: ["longitudinal study", "25 years", "R&D", "diet evolution", "genetic adaptation"],
    category: "methodology"
  },
  {
    topic: "key_discovery_1",
    title: "Agricultural Impact Discovery",
    content: "The industrialization of agriculture, initiated around 1913, has negatively impacted human DNA. This damage has led to genetic mutations that cause cellular deterioration, contributing to various health issues, premature aging, and diseases.",
    keywords: ["agriculture", "1913", "DNA damage", "mutations", "cellular deterioration", "aging"],
    category: "discovery"
  },
  {
    topic: "key_discovery_2",
    title: "DNA Control Principle",
    content: "DNA Damage Repair Science: DNA controls disease and aging - we control DNA. By understanding and manipulating DNA repair mechanisms, we can address the root causes of disease and aging rather than just treating symptoms.",
    keywords: ["DNA repair", "disease control", "aging control", "root cause", "precision medicine"],
    category: "discovery"
  },
  {
    topic: "therapeutic_approach",
    title: "Precision Health Restoration",
    content: "A complete method to restore wellness at the core biological level by studying diet evolution and genetic adaptation. This approach targets the fundamental genetic and cellular mechanisms that drive health and longevity.",
    keywords: ["wellness restoration", "biological level", "genetic mechanisms", "longevity", "precision health"],
    category: "therapeutic"
  },
  {
    topic: "sirtuin_pathway",
    title: "Sirtuin Activation Research",
    content: "SIRT1-7 family of proteins play crucial roles in DNA repair, metabolic regulation, and stress resistance. Targeted activation of sirtuins through NAD+ precursors and specific compounds shows promise for longevity enhancement.",
    keywords: ["sirtuins", "SIRT1", "NAD+", "metabolic regulation", "stress resistance", "longevity"],
    category: "molecular_targets"
  },
  {
    topic: "telomere_maintenance",
    title: "Telomere Biology Insights",
    content: "Telomere shortening accelerated by industrial-age toxin exposure contributes to cellular senescence. Strategies to maintain telomere length through telomerase activation and lifestyle interventions are under investigation.",
    keywords: ["telomeres", "telomerase", "cellular senescence", "aging", "intervention"],
    category: "molecular_targets"
  },
  {
    topic: "mitochondrial_health",
    title: "Mitochondrial Function Restoration",
    content: "Mitochondrial dysfunction is a hallmark of aging accelerated by DNA damage. Restoring mitochondrial biogenesis and function through targeted interventions can reverse aspects of cellular aging.",
    keywords: ["mitochondria", "biogenesis", "cellular aging", "energy metabolism", "restoration"],
    category: "molecular_targets"
  }
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action = "seed" } = await req.json();

    console.log("[Federated Seed] Starting seed operation");

    const federatedUrl = Deno.env.get("FEDERATED_SUPABASE_URL");
    const federatedKey = Deno.env.get("FEDERATED_SUPABASE_ANON_KEY");
    const syncKey = Deno.env.get("FEDERATED_SYNC_KEY");

    if (!federatedUrl || !federatedKey) {
      return new Response(
        JSON.stringify({ success: false, message: "Federated Core not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const nodeId = federatedUrl.replace(/https?:\/\//, "").split(".")[0];
    console.log("[Federated Seed] Connected to node:", nodeId);

    const federatedClient = createClient(federatedUrl, federatedKey, {
      global: { headers: { "X-Sync-Key": syncKey || "" } }
    });

    const results = {
      genomics_insights: { inserted: 0, errors: [] as string[] },
      knowledge_base: { inserted: 0, errors: [] as string[] }
    };

    // Seed genomics_insights
    console.log("[Federated Seed] Seeding genomics_insights with", genomicsInsights.length, "records");
    for (const insight of genomicsInsights) {
      const { error } = await federatedClient.from("genomics_insights").insert({
        ...insight,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (error) {
        console.log("[Federated Seed] Error inserting insight:", error.message);
        results.genomics_insights.errors.push(error.message);
      } else {
        results.genomics_insights.inserted++;
      }
    }

    // Seed knowledge_base
    console.log("[Federated Seed] Seeding knowledge_base with", knowledgeBase.length, "records");
    for (const knowledge of knowledgeBase) {
      const { error } = await federatedClient.from("knowledge_base").insert({
        ...knowledge,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (error) {
        console.log("[Federated Seed] Error inserting knowledge:", error.message);
        results.knowledge_base.errors.push(error.message);
      } else {
        results.knowledge_base.inserted++;
      }
    }

    const totalInserted = results.genomics_insights.inserted + results.knowledge_base.inserted;
    const totalErrors = results.genomics_insights.errors.length + results.knowledge_base.errors.length;

    console.log("[Federated Seed] Complete. Inserted:", totalInserted, "Errors:", totalErrors);

    return new Response(
      JSON.stringify({
        success: totalInserted > 0,
        node: nodeId,
        results,
        summary: {
          totalInserted,
          totalErrors,
          message: totalInserted > 0 
            ? `Successfully seeded ${totalInserted} records to Federated Core`
            : "No records inserted - tables may need to be created first"
        },
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Federated Seed] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Seed operation failed";

    return new Response(
      JSON.stringify({ success: false, message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
