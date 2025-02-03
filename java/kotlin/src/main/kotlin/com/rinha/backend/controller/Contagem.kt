package com.rinha.backend.controller

import com.rinha.backend.respository.PessoaRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.*

@RestController
@RequestMapping("/contagem-pessoas")
class Contagem(@Autowired private val pessoaRepository: PessoaRepository) {
  @GetMapping("")
  fun getAll(@RequestParam("t") query: Optional<String>): ResponseEntity<Long> {

    val pessoas = pessoaRepository.count()

    return ResponseEntity(
      pessoas,
      HttpStatus.OK
    )
  }
}
