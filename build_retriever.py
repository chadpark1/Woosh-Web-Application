from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.docstore.document import Document
import os
from langchain_community.document_loaders import Docx2txtLoader, PyPDFLoader
from pathlib import Path

docs_dir = Path("client_docs")
docs = []


for f in docs_dir.glob("*"):
    if f.suffix.lower() == ".docx":
        docs.extend(Docx2txtLoader(str(f)).load())
    elif f.suffix.lower() == ".pdf":
        docs.extend(PyPDFLoader(str(f)).load())

if not docs:
    raise FileNotFoundError("can't find")

print(f"✅ load {len(docs)} docs")



splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
split_docs = splitter.split_documents(docs)
print(f"load {len(split_docs)} document")


embeddings = HuggingFaceEmbeddings(model_name="intfloat/multilingual-e5-small")
vectordb = FAISS.from_documents(split_docs, embeddings)


vectordb.save_local("faiss_db")
print("save ./faiss_db")
