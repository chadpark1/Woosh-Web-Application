import os
from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA


load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise ValueError("can't find env")

os.environ["OPENAI_API_KEY"] = api_key


embeddings = HuggingFaceEmbeddings(model_name="intfloat/multilingual-e5-small")
db = FAISS.load_local("faiss_db", embeddings, allow_dangerous_deserialization=True)
retriever = db.as_retriever(search_kwargs={"k": 5})


llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)


prompt_template = """
You are startup Woosh’s helpful customer support assistant.

Woosh is a Berkeley Skydeck-backed startup that aims to revolutionize local
business deliveries (less-than-pallet loads; 50–1000 pounds) by using empty space
within commuter vehicles. They plan to launch in 2027 and have several companies
(e.g., medical supplies) interested.

Always answer based on the provided context.
- Keep answers short (2–3 sentences), friendly, and conversational.
- Summarize in your own words.
- If the answer isn’t in the context, say you don’t have that info yet.

Context:
{context}

Question: {question}
Answer:
"""

QA_PROMPT = PromptTemplate(
    input_variables=["context", "question"],
    template=prompt_template
)


qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=retriever,
    chain_type="stuff",
    chain_type_kwargs={"prompt": QA_PROMPT}
)


print("💬 Woosh RAG Chat Ready!")
while True:
    query = input("\n❓ Your question (or 'exit'): ")
    if query.lower() in ["exit", "quit"]:
        break
    answer = qa_chain.run(query)
    print("🤖", answer)
