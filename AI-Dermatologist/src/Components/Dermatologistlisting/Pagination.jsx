import React from "react"
import styles from './Pagination.module.css';


function Pagination({ totalPosts, postPerPage,setCurrentPage, currentPage }) {
  let pages = []
    
  for(let i = 1; i<=Math.ceil(totalPosts/postPerPage);i++){
     pages.push(i);
  }

    return(
        <div className={styles.pagination}>
          {
            pages.map((page,indx)=>(
                <button 
                key={indx}
                onClick={() => setCurrentPage(page)}
                className={page == currentPage ? styles.active : ""}
                
                >{page}</button>
            ))
          }
        </div>
    )
}

export default Pagination;