package com.rinha.backend.respository

import com.rinha.backend.model.Pessoa
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository

interface PessoaRepository : JpaRepository<Pessoa, String> {
  fun findBySearchableIgnoreCaseContaining(searchable: String, pageable: Pageable): List<Pessoa>?
}
